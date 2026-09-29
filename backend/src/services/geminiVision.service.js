const env = require('../config/env');

/**
 * Gemini Vision Auto-Tagging Service
 * Uses Google Gemini (configurable model, e.g. gemini-2.5-flash or gemini-2.0-flash)
 * to automatically identify garment category, subcategory, length, layerType,
 * fabric, color, seasons, formality score, and style tags from garment images.
 */
async function analyzeGarmentImage(imageBufferOrUrl, mimeType = 'image/jpeg', hintName = '') {
  const apiKey = env.geminiApiKey;
  const modelName = env.geminiModel || 'gemini-2.5-flash';

  if (apiKey) {
    try {
      const visionResult = await callGeminiVision(apiKey, modelName, imageBufferOrUrl, mimeType, hintName);
      if (visionResult) {
        return normalizeTaggingResult(visionResult, hintName);
      }
    } catch (err) {
      console.warn(`Gemini Vision (${modelName}) failed or timed out: ${err.message}. Using intelligent heuristic classifier.`);
    }
  }

  // Resilient heuristic auto-tagger fallback
  return generateHeuristicTags(hintName);
}

async function callGeminiVision(apiKey, model, imageBufferOrUrl, mimeType, hintName) {
  let imagePart;

  if (Buffer.isBuffer(imageBufferOrUrl)) {
    imagePart = {
      inlineData: {
        data: imageBufferOrUrl.toString('base64'),
        mimeType: mimeType || 'image/jpeg',
      },
    };
  } else if (typeof imageBufferOrUrl === 'string' && imageBufferOrUrl.startsWith('http')) {
    // Fetch image to send base64 to Gemini
    const res = await fetch(imageBufferOrUrl);
    if (!res.ok) throw new Error(`Could not fetch image from URL: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = res.headers.get('content-type') || mimeType || 'image/jpeg';
    imagePart = {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: contentType,
      },
    };
  } else {
    throw new Error('Unsupported image input format');
  }

  const promptText = `
You are an expert luxury fashion cataloguer and personal stylist.
Analyze this garment image thoroughly.
${hintName ? `User file name/hint: "${hintName}"` : ''}

Respond ONLY with a valid, clean JSON object matching this exact structure with NO markdown or explanations:
{
  "name": "Concise editorial garment title (e.g., 'Tailored Charcoal Wool Blazer')",
  "category": "One of: top, bottom, layer, shoe, accessory",
  "subcategory": "One of: t-shirt, shirt, blouse, sweater, hoodie, blazer, coat, jacket, trench_coat, cardigan, jeans, trousers, skirt, shorts, sneakers, boots, loafers, heels, sandals, bag, belt, scarf, hat, jewelry",
  "length": "One of: cropped, waist, hip, regular, knee, midi, maxi, ankle, unspecified",
  "layerType": "One of: base, mid, outer, unspecified (Note: coats/jackets/blazers are outer; cardigans/sweaters are mid; shirts/t-shirts are base)",
  "color": {
    "name": "Dominant color name (e.g., camel, navy, cream, charcoal)",
    "hex": "Approximate 6-digit hex code e.g. #3b82f6",
    "temperature": "One of: warm, cool, neutral"
  },
  "fabric": "One of: cotton, linen, wool, cashmere, silk, polyester, denim, leather, nylon, fleece, knit, blend, other",
  "season": ["Array of: spring, summer, fall, winter, all_season"],
  "formality": 5,
  "tags": ["Array of 3 to 6 style tags, e.g. 'minimalist', 'oversized', 'capsule-essential', 'smart-casual'"]
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: promptText },
            imagePart,
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return null;

  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

function normalizeTaggingResult(raw, fallbackName = '') {
  const validCategories = ['top', 'bottom', 'layer', 'shoe', 'accessory'];
  const validLengths = ['cropped', 'waist', 'hip', 'regular', 'knee', 'midi', 'maxi', 'ankle', 'unspecified'];
  const validLayerTypes = ['base', 'mid', 'outer', 'unspecified'];
  const validFabrics = ['cotton', 'linen', 'wool', 'cashmere', 'silk', 'polyester', 'denim', 'leather', 'nylon', 'fleece', 'knit', 'blend', 'other'];

  const category = validCategories.includes(raw.category?.toLowerCase())
    ? raw.category.toLowerCase()
    : 'top';

  const length = validLengths.includes(raw.length?.toLowerCase())
    ? raw.length.toLowerCase()
    : 'regular';

  const layerType = validLayerTypes.includes(raw.layerType?.toLowerCase())
    ? raw.layerType.toLowerCase()
    : category === 'layer' ? 'outer' : 'base';

  const fabric = validFabrics.includes(raw.fabric?.toLowerCase())
    ? raw.fabric.toLowerCase()
    : 'blend';

  return {
    name: raw.name || fallbackName || 'Curated Wardrobe Piece',
    category,
    subcategory: raw.subcategory || 'general',
    length,
    layerType,
    color: {
      name: raw.color?.name || 'Neutral',
      hex: raw.color?.hex?.startsWith('#') ? raw.color.hex : '#64748b',
      temperature: ['warm', 'cool', 'neutral'].includes(raw.color?.temperature)
        ? raw.color.temperature
        : 'neutral',
    },
    fabric,
    season: Array.isArray(raw.season) && raw.season.length > 0 ? raw.season : ['all_season'],
    formality: typeof raw.formality === 'number' ? Math.min(10, Math.max(1, raw.formality)) : 5,
    tags: Array.isArray(raw.tags) ? raw.tags : ['capsule-essential'],
  };
}

function generateHeuristicTags(name = '') {
  const lower = name.toLowerCase();
  let category = 'top';
  let subcategory = 't-shirt';
  let length = 'regular';
  let layerType = 'base';
  let fabric = 'cotton';
  let formality = 5;
  const tags = [];

  if (lower.includes('blazer') || lower.includes('coat') || lower.includes('jacket') || lower.includes('cardigan') || lower.includes('trench')) {
    category = 'layer';
    layerType = 'outer';
    if (lower.includes('blazer')) {
      subcategory = 'blazer';
      formality = 8;
      fabric = 'wool';
      tags.push('tailored', 'executive', 'smart-casual');
    } else if (lower.includes('trench')) {
      subcategory = 'trench_coat';
      length = 'knee';
      formality = 7;
      fabric = 'cotton';
      tags.push('outerwear', 'classic', 'weather-shield');
    } else {
      subcategory = 'jacket';
      formality = 6;
      tags.push('layering', 'versatile');
    }
  } else if (lower.includes('jean') || lower.includes('pant') || lower.includes('trouser') || lower.includes('skirt') || lower.includes('short')) {
    category = 'bottom';
    if (lower.includes('skirt')) {
      subcategory = 'skirt';
      length = lower.includes('mini') ? 'cropped' : lower.includes('maxi') ? 'maxi' : 'knee';
      formality = 6;
      tags.push('feminine', 'elegant');
    } else if (lower.includes('short')) {
      subcategory = 'shorts';
      length = 'cropped';
      formality = 3;
      tags.push('warm-weather', 'casual');
    } else if (lower.includes('trouser') || lower.includes('tailored') || lower.includes('slacks')) {
      subcategory = 'trousers';
      formality = 8;
      fabric = 'wool';
      tags.push('office', 'refined');
    } else {
      subcategory = 'jeans';
      fabric = 'denim';
      formality = 5;
      tags.push('everyday', 'capsule-staple');
    }
  } else if (lower.includes('shoe') || lower.includes('boot') || lower.includes('sneaker') || lower.includes('heel') || lower.includes('loafer')) {
    category = 'shoe';
    if (lower.includes('boot')) {
      subcategory = 'boots';
      formality = 7;
      fabric = 'leather';
      tags.push('fall-winter', 'statement');
    } else if (lower.includes('heel')) {
      subcategory = 'heels';
      formality = 9;
      tags.push('evening', 'formal');
    } else if (lower.includes('loafer')) {
      subcategory = 'loafers';
      formality = 7;
      fabric = 'leather';
      tags.push('preppy', 'smart-casual');
    } else {
      subcategory = 'sneakers';
      formality = 4;
      tags.push('comfort', 'streetwear');
    }
  } else if (lower.includes('bag') || lower.includes('tote') || lower.includes('belt') || lower.includes('scarf') || lower.includes('hat') || lower.includes('jewelry')) {
    category = 'accessory';
    subcategory = lower.includes('bag') ? 'bag' : lower.includes('belt') ? 'belt' : lower.includes('scarf') ? 'scarf' : 'accessory';
    formality = 6;
    tags.push('accent', 'finishing-touch');
  } else {
    // Default top
    if (lower.includes('shirt') || lower.includes('button')) {
      subcategory = 'shirt';
      formality = 7;
      fabric = 'cotton';
      tags.push('crisp', 'polished');
    } else if (lower.includes('sweater') || lower.includes('knit')) {
      subcategory = 'sweater';
      layerType = 'mid';
      fabric = 'wool';
      formality = 6;
      tags.push('cozy', 'knitwear');
    } else if (lower.includes('hoodie')) {
      subcategory = 'hoodie';
      layerType = 'mid';
      fabric = 'cotton';
      formality = 3;
      tags.push('streetwear', 'relaxed');
    } else {
      subcategory = 't-shirt';
      formality = 4;
      fabric = 'cotton';
      tags.push('basics', 'casual');
    }
  }

  // Color heuristic
  let hex = '#475569';
  let colorName = 'Slate Blue';
  if (lower.includes('white') || lower.includes('cream')) { hex = '#f8fafc'; colorName = 'Cream White'; }
  else if (lower.includes('black')) { hex = '#0f172a'; colorName = 'Obsidian Black'; }
  else if (lower.includes('navy') || lower.includes('blue')) { hex = '#1e3a8a'; colorName = 'Navy Blue'; }
  else if (lower.includes('beige') || lower.includes('tan') || lower.includes('camel')) { hex = '#d97706'; colorName = 'Warm Camel'; }
  else if (lower.includes('grey') || lower.includes('gray')) { hex = '#64748b'; colorName = 'Heather Grey'; }
  else if (lower.includes('green') || lower.includes('olive')) { hex = '#065f46'; colorName = 'Olive Green'; }
  else if (lower.includes('burgundy') || lower.includes('red')) { hex = '#991b1b'; colorName = 'Deep Burgundy'; }

  return {
    name: name.trim() || 'Curated Wardrobe Piece',
    category,
    subcategory,
    length,
    layerType,
    color: {
      name: colorName,
      hex,
      temperature: 'neutral',
    },
    fabric,
    season: ['all_season'],
    formality,
    tags: tags.length > 0 ? tags : ['capsule-essential', 'versatile'],
  };
}

module.exports = {
  analyzeGarmentImage,
};
