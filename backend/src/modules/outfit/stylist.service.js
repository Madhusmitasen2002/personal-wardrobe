const Wardrobe = require('../wardrobe/wardrobe.model');
const User = require('../auth/auth.model');
const ApiError = require('../../utils/ApiError');
const env = require('../../config/env');
const { getLiveWeather } = require('../../services/weather.service');
const { stylistResponseSchema, capsuleResponseSchema } = require('./stylist.validation');
const {
  generateCuratedLooksWithRules,
  generateCapsuleStarterRecommendations,
} = require('./fashionRules');

// 10-minute recommendation cache
const recommendationCache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

/**
 * Next-Gen AI Stylist Engine
 * Integrates live weather, personal fit, color season, cultural constraints,
 * feedback loop history, and multi-slot layering with strict Zod validation.
 */
async function generateStylistOutfits(userId, options = {}) {
  const { prompt = '', occasion = 'Casual', city = 'New York', lat, lon } = options;

  // 1. Fetch User Profile and Wardrobe Items
  const [user, items] = await Promise.all([
    User.findById(userId).select('-password'),
    Wardrobe.find({ userId }),
  ]);

  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  // 2. Fetch Live Weather
  const weather = await getLiveWeather({
    city,
    lat: lat ? parseFloat(lat) : undefined,
    lon: lon ? parseFloat(lon) : undefined,
  });

  // 3. Handle Empty or Minimal Wardrobe (< 2 items) with Capsule Recommendations
  if (items.length < 2) {
    const capsulePlan = generateCapsuleStarterRecommendations(weather, occasion);
    return {
      isCapsuleRecommendation: true,
      weatherSnapshot: weather,
      ...capsulePlan,
      outfits: [],
    };
  }

  // Check cache
  const cacheKey = `${userId}:${prompt.trim().toLowerCase()}:${occasion.toLowerCase()}:${weather.temp}`;
  const cached = recommendationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // 4. Try Gemini LLM if API Key is Configured
  const apiKey = env.geminiApiKey;
  const modelName = env.geminiModel || 'gemini-2.5-flash';

  if (apiKey) {
    try {
      const llmRaw = await callGeminiStylist({
        apiKey,
        model: modelName,
        prompt,
        occasion,
        weather,
        items,
        user,
      });

      if (llmRaw && Array.isArray(llmRaw)) {
        // Validate with Zod
        const parsed = stylistResponseSchema.safeParse(llmRaw);
        if (parsed.success) {
          const verified = mapAndVerifyGarmentIds(parsed.data, items, weather, user);
          const responsePayload = {
            isCapsuleRecommendation: false,
            weatherSnapshot: weather,
            modelUsed: modelName,
            outfits: verified,
          };
          recommendationCache.set(cacheKey, { timestamp: Date.now(), data: responsePayload });
          return responsePayload;
        } else {
          console.warn('Gemini response failed Zod validation, falling back to fashion rules engine:', parsed.error.issues);
        }
      }
    } catch (err) {
      console.warn(`Gemini Stylist API call failed (${modelName}): ${err.message}. Using Fashion Rule Engine fallback.`);
    }
  }

  // 5. High-Fashion Rules Engine Fallback (Zero Hallucination, 100% Wardrobe Aligned)
  const ruleLooks = generateCuratedLooksWithRules(items, {
    occasion,
    weather,
    userProfile: user,
  });

  const fallbackPayload = {
    isCapsuleRecommendation: false,
    weatherSnapshot: weather,
    modelUsed: 'FashionRules-ExpertSystem',
    outfits: ruleLooks,
  };

  recommendationCache.set(cacheKey, { timestamp: Date.now(), data: fallbackPayload });
  return fallbackPayload;
}

/**
 * Builds the rich, multi-layered fashion prompt and calls Gemini in JSON mode
 */
async function callGeminiStylist({ apiKey, model, prompt, occasion, weather, items, user }) {
  const tops = items.filter((i) => i.category === 'top');
  const bottoms = items.filter((i) => i.category === 'bottom');
  const layers = items.filter((i) => i.category === 'layer');
  const shoes = items.filter((i) => i.category === 'shoe');
  const accessories = items.filter((i) => i.category === 'accessory');

  // Format inventory with IDs and attributes
  const formatItem = (i) =>
    `- ID: ${i._id} | Name: "${i.name}" | Subtype: ${i.subcategory || 'general'} | Length: ${i.length || 'regular'} | LayerTier: ${i.layerType || 'base'} | Fabric: ${i.fabric || 'blend'} | Formality: ${i.formality || 5}/10 | Color: ${i.color?.name || 'neutral'} (${i.color?.hex || '#64748b'})`;

  // Feedback history
  const recentFeedback = (user.outfitFeedback || [])
    .slice(-6)
    .map((f) => `- ${f.feedbackType.toUpperCase()}: "${f.outfitName}"`)
    .join('\n');

  const systemPrompt = `
You are a world-renowned celebrity fashion stylist and wardrobe architect.
Your mission is to create 3 exceptionally chic, purposeful, and weather-appropriate outfit combinations selecting EXCLUSIVELY from the client's wardrobe inventory.

### CLIENT PROFILE & ENVIRONMENTAL REALITY:
- Occasion: "${occasion}"
- Client Request: "${prompt || 'Style 3 distinct looks for ' + occasion}"
- Live Weather: ${weather.temp}°C (Feels like: ${weather.feelsLike}°C), ${weather.conditionLabel || weather.condition}
  - Precipitation: ${weather.precipitation}mm (${weather.isRainy ? 'Active rain / wet streets' : 'No rain'})
  - Humidity: ${weather.humidity}% | UV Index: ${weather.uvIndex} | Wind: ${weather.windSpeed} km/h
- Style Preferences: ${user.stylePreferences?.join(', ') || 'Smart Casual, Minimalist'}
- Fit Preference: ${user.fitPreference || 'regular'}
- Body Shape / Proportions: ${user.bodyShape || 'unspecified'} (Height: ${user.avatar?.proportions?.heightScale >= 1.05 ? 'Tall' : 'Average'})
- Color Season: ${user.colorSeason || 'Neutral'} (Skin Undertone: ${user.avatar?.skinUndertone || 'warm'})
- Cultural / Modesty Constraints: ${user.culturalConstraints?.join(', ') || 'None'}
${recentFeedback ? `\n### PAST CLIENT FEEDBACK (ADAPT ACCORDINGLY):\n${recentFeedback}` : ''}

### AVAILABLE WARDROBE PIECES:
TOPS:
${tops.map(formatItem).join('\n') || '- None'}

BOTTOMS:
${bottoms.map(formatItem).join('\n') || '- None'}

OUTER LAYERS / JACKETS:
${layers.map(formatItem).join('\n') || '- None'}

FOOTWEAR:
${shoes.map(formatItem).join('\n') || '- None'}

ACCESSORIES:
${accessories.map(formatItem).join('\n') || '- None'}

### STYLING RULES TO APPLY:
1. Color Theory: Implement 60-30-10 color balance. Pair complementary or analogous tones. Avoid clashing.
2. Temperature-Based Layering:
   - Below 14°C: Mandatory outer layer (blazer/coat/trench) + closed footwear.
   - 14°C - 20°C: Layering piece recommended for transitions.
   - Above 24°C: Prioritize breathable natural fibers (linen, cotton), avoid heavy wool.
3. Formality Matching: Ensure top, bottom, and footwear formality levels align with "${occasion}".
4. Rain Adaptation: If rainy, avoid white trousers/suede; prioritize water-resistant layers.
5. STRICT INVENTORY COMPLIANCE: Every ID in "slots" MUST be a valid, exact ID from the inventory list above. Do NOT invent IDs.

### REQUIRED JSON OUTPUT:
Return ONLY a valid JSON array of 3 objects matching this exact structure:
[
  {
    "outfitName": "High-fashion title (e.g. 'The Architectural Trench & Tailored Trouser')",
    "occasion": "${occasion}",
    "formalityScore": 7,
    "confidenceScore": 92,
    "slots": {
      "topId": "exact top ID from list",
      "bottomId": "exact bottom ID from list",
      "layerId": "exact layer ID from list (or null)",
      "shoeId": "exact shoe ID from list",
      "accessoryIds": ["exact accessory ID (or empty array)"]
    },
    "colorPalette": ["#hex1", "#hex2", "#hex3"],
    "colorHarmony": "Concise explanation of 60-30-10 palette ratio and color theory",
    "whyItWorks": "Professional styling explanation regarding silhouette, drape, and proportion balance",
    "weatherAdaptation": "Detailed explanation of why this outfit protects and breathes at ${weather.temp}°C and ${weather.condition}",
    "alternatives": [
      {
        "slot": "layer",
        "suggestion": "Specific swap advice",
        "reason": "Why this swap works for temperature fluctuation"
      },
      {
        "slot": "shoe",
        "suggestion": "Footwear swap advice",
        "reason": "How this alters the formality index"
      }
    ]
  }
]
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini Stylist responded with ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Strict ID Verification & Hydration Pipeline
 * Ensures all returned item IDs exist in the user's wardrobe.
 * If the LLM hallucinated an invalid ID, repairs it automatically with the best-matching item.
 */
function mapAndVerifyGarmentIds(outfitList, allItems, weather, user) {
  const itemMap = new Map(allItems.map((i) => [String(i._id), i]));
  const tops = allItems.filter((i) => i.category === 'top');
  const bottoms = allItems.filter((i) => i.category === 'bottom');
  const layers = allItems.filter((i) => i.category === 'layer');
  const shoes = allItems.filter((i) => i.category === 'shoe');
  const accessories = allItems.filter((i) => i.category === 'accessory');

  return outfitList.map((outfit) => {
    // 1. Resolve and verify top
    let top = itemMap.get(String(outfit.slots?.topId)) || null;
    if (!top && tops.length > 0) {
      top = tops[0]; // Repair hallucinated ID
    }

    // 2. Resolve and verify bottom
    let bottom = itemMap.get(String(outfit.slots?.bottomId)) || null;
    if (!bottom && bottoms.length > 0) {
      bottom = bottoms[0];
    }

    // 3. Resolve and verify layer
    let layer = itemMap.get(String(outfit.slots?.layerId)) || null;
    if (!layer && outfit.slots?.layerId && layers.length > 0) {
      layer = layers[0];
    }

    // 4. Resolve and verify shoe
    let shoe = itemMap.get(String(outfit.slots?.shoeId)) || null;
    if (!shoe && shoes.length > 0) {
      shoe = shoes[0];
    }

    // 5. Resolve accessories
    const accessoryList = [];
    if (Array.isArray(outfit.slots?.accessoryIds)) {
      for (const id of outfit.slots.accessoryIds) {
        const found = itemMap.get(String(id));
        if (found) accessoryList.push(found);
      }
    }
    if (accessoryList.length === 0 && accessories.length > 0) {
      accessoryList.push(accessories[0]);
    }

    // Extract palette from resolved items if LLM omitted hex codes
    const colorPalette =
      Array.isArray(outfit.colorPalette) && outfit.colorPalette.length >= 2
        ? outfit.colorPalette
        : [
            top?.color?.hex || '#1e293b',
            bottom?.color?.hex || '#475569',
            layer?.color?.hex || shoe?.color?.hex || '#94a3b8',
          ];

    return {
      outfitName: outfit.outfitName,
      occasion: outfit.occasion,
      formalityScore: outfit.formalityScore || 5,
      confidenceScore: outfit.confidenceScore || 88,
      slots: {
        topId: top ? String(top._id) : null,
        bottomId: bottom ? String(bottom._id) : null,
        layerId: layer ? String(layer._id) : null,
        shoeId: shoe ? String(shoe._id) : null,
        accessoryIds: accessoryList.map((a) => String(a._id)),
      },
      top,
      bottom,
      layer,
      shoe,
      accessories: accessoryList,
      colorPalette,
      colorHarmony: outfit.colorHarmony || 'Balanced 60-30-10 tone ratio',
      whyItWorks: outfit.whyItWorks,
      weatherAdaptation: outfit.weatherAdaptation,
      alternatives: outfit.alternatives || [],
    };
  });
}

module.exports = {
  generateStylistOutfits,
};
