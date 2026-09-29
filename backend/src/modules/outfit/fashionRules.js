/**
 * Fashion Styling Rules & Color Theory Engine
 * Encodes real-world celebrity styling, thermal layering, color harmony,
 * formality balancing, and feedback-loop adjustments.
 */

// 60-30-10 Color Palettes & Color Theory
const COLOR_HARMONY_PALETTES = [
  { name: 'Monochrome Minimalist', hexes: ['#0f172a', '#334155', '#94a3b8'], type: 'monochromatic' },
  { name: 'Quiet Luxury Earth', hexes: ['#d97706', '#78350f', '#fef3c7'], type: 'analogous' },
  { name: 'Executive High-Contrast', hexes: ['#1e293b', '#f8fafc', '#7c3aed'], type: 'complementary' },
  { name: 'Warm Autumnal Harmony', hexes: ['#991b1b', '#b45309', '#fef08a'], type: 'warm' },
  { name: 'Nordic Clean Slate', hexes: ['#1e3a8a', '#64748b', '#f1f5f9'], type: 'cool' },
  { name: 'Olive Contemporary', hexes: ['#14532d', '#475569', '#dcfce7'], type: 'earth' },
];

/**
 * Calculates a compatibility score for a garment given weather, occasion formality,
 * and user preferences.
 */
function scoreGarmentForContext(item, context = {}) {
  const { weather = {}, formalityTarget = 5, feedbackWeights = {}, fitPreference = 'regular' } = context;
  const temp = weather.feelsLike ?? weather.temp ?? 22;
  const isRainy = weather.isRainy || (weather.precipitation ?? 0) > 0.5;

  let score = 50;

  // 1. Temperature & Layering Compatibility
  const cat = item.category?.toLowerCase();
  const subcat = (item.subcategory || '').toLowerCase();
  const fabric = (item.fabric || '').toLowerCase();
  const length = (item.length || '').toLowerCase();
  const layerType = (item.layerType || '').toLowerCase();

  if (temp < 10) {
    // Freezing / Cold: Require heavy fabrics, outer layers, boots
    if (['wool', 'cashmere', 'leather', 'fleece', 'down'].includes(fabric)) score += 25;
    if (['blazer', 'coat', 'jacket', 'trench_coat'].includes(subcat)) score += 20;
    if (['boots', 'boot'].includes(subcat)) score += 15;
    if (length === 'cropped' || subcat === 'shorts') score -= 35;
    if (['linen', 'silk'].includes(fabric)) score -= 20;
  } else if (temp <= 18) {
    // Mild / Cool: Great for layering (cardigans, blazers, light jackets)
    if (['knit', 'wool', 'cotton', 'denim'].includes(fabric)) score += 15;
    if (layerType === 'mid' || layerType === 'outer') score += 18;
    if (['trousers', 'jeans'].includes(subcat)) score += 12;
    if (subcat === 'shorts') score -= 20;
  } else if (temp <= 24) {
    // Pleasant / Warm: Light layers, cotton, versatile shoes
    if (['cotton', 'linen', 'blend'].includes(fabric)) score += 15;
    if (['blazer', 'cardigan'].includes(subcat)) score += 10;
    if (['wool', 'fleece'].includes(fabric)) score -= 20;
  } else {
    // Hot (> 24°C): Breathable, natural fibers, lightweight
    if (['linen', 'silk', 'cotton'].includes(fabric)) score += 25;
    if (length === 'cropped' || ['shorts', 'skirt', 'sandals'].includes(subcat)) score += 20;
    if (['wool', 'cashmere', 'leather', 'fleece'].includes(fabric)) score -= 35;
    if (layerType === 'outer' && !['linen', 'cotton'].includes(fabric)) score -= 25;
  }

  // 2. Rain Defense
  if (isRainy) {
    if (subcat.includes('trench') || subcat.includes('jacket') || subcat.includes('boots')) score += 20;
    if (fabric === 'leather' || fabric === 'nylon') score += 15;
    if (fabric === 'suede' || fabric === 'silk') score -= 30; // Water damages suede/silk
    if (subcat === 'sandals' || (item.color?.hex || '').toLowerCase() === '#ffffff') score -= 20;
  }

  // 3. Formality Matching
  const itemFormality = item.formality ?? 5;
  const formalityDelta = Math.abs(itemFormality - formalityTarget);
  score += Math.max(-15, 30 - formalityDelta * 8); // Strong boost for matching formality
  if (formalityTarget >= 7 && itemFormality <= 4) {
    score -= 30; // Strongly penalize casual items (tees, shorts) for formal occasions
  }


  // 4. Wear Frequency & Fatigue
  if (item.wearCount && item.wearCount > 3) {
    score -= Math.min(15, item.wearCount * 2);
  }
  if (item.lastWornAt) {
    const daysSinceWorn = (Date.now() - new Date(item.lastWornAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceWorn < 4) score -= 20; // Don't repeat what was worn in last 4 days
  }

  // 5. Feedback Loop Weights
  if (feedbackWeights[cat]) score += feedbackWeights[cat];
  if (feedbackWeights[subcat]) score += feedbackWeights[subcat];
  if (feedbackWeights[fabric]) score += feedbackWeights[fabric];

  return Math.max(5, Math.round(score));
}

/**
 * Derives user feedback weights from outfit feedback history.
 */
function compileFeedbackWeights(feedbackList = []) {
  const weights = {};

  for (const fb of feedbackList) {
    const modifier = fb.feedbackType === 'liked' ? 8 : fb.feedbackType === 'disliked' ? -12 : -6;
    if (Array.isArray(fb.items)) {
      for (const itm of fb.items) {
        if (itm.slot) weights[itm.slot] = (weights[itm.slot] || 0) + modifier;
        if (itm.name) {
          const lower = itm.name.toLowerCase();
          for (const token of lower.split(' ')) {
            if (token.length > 3) weights[token] = (weights[token] || 0) + modifier;
          }
        }
      }
    }
  }

  return weights;
}

/**
 * Rule-Based Stylist Recommendation Engine (Zero-Cost Resilient Fallback)
 * Produces structured looks adhering strictly to fashion theory, weather constraints,
 * and user wardrobe inventory.
 */
function generateCuratedLooksWithRules(allItems = [], options = {}) {
  const { occasion = 'Casual', weather = {}, userProfile = {} } = options;

  const tops = allItems.filter((i) => i.category === 'top');
  const bottoms = allItems.filter((i) => i.category === 'bottom');
  const layers = allItems.filter((i) => i.category === 'layer');
  const shoes = allItems.filter((i) => i.category === 'shoe');
  const accessories = allItems.filter((i) => i.category === 'accessory');

  // Formality mapping
  const occLower = occasion.toLowerCase();
  let formalityTarget = 5;
  if (occLower.includes('gala') || occLower.includes('black tie') || occLower.includes('formal wedding')) formalityTarget = 10;
  else if (occLower.includes('interview') || occLower.includes('business') || occLower.includes('executive')) formalityTarget = 8;
  else if (occLower.includes('date') || occLower.includes('dinner') || occLower.includes('cocktail')) formalityTarget = 7;
  else if (occLower.includes('brunch') || occLower.includes('smart casual') || occLower.includes('gallery')) formalityTarget = 6;
  else if (occLower.includes('beach') || occLower.includes('workout') || occLower.includes('lounge')) formalityTarget = 2;

  const feedbackWeights = compileFeedbackWeights(userProfile.outfitFeedback || []);
  const context = { weather, formalityTarget, feedbackWeights, fitPreference: userProfile.fitPreference || 'regular' };

  // Score and sort slots
  const sortedTops = [...tops].sort((a, b) => scoreGarmentForContext(b, context) - scoreGarmentForContext(a, context));
  const sortedBottoms = [...bottoms].sort((a, b) => scoreGarmentForContext(b, context) - scoreGarmentForContext(a, context));
  const sortedLayers = [...layers].sort((a, b) => scoreGarmentForContext(b, context) - scoreGarmentForContext(a, context));
  const sortedShoes = [...shoes].sort((a, b) => scoreGarmentForContext(b, context) - scoreGarmentForContext(a, context));
  const sortedAccessories = [...accessories].sort((a, b) => scoreGarmentForContext(b, context) - scoreGarmentForContext(a, context));

  const temp = weather.feelsLike ?? weather.temp ?? 22;
  const isCold = temp < 18;

  const lookArchetypes = [
    {
      namePrefix: formalityTarget >= 7 ? 'The Architectural Executive' : isCold ? 'Cozy Tailored Layer' : 'Refined Minimalist Stride',
      harmony: '60% tonal base with a 30% structural anchor and 10% refined metallic or leather accent.',
      why: `Anchors the silhouette with clean vertical lines suited for ${occasion}. Balanced proportions give intentionality without appearing overly styled.`,
      weatherReason: isCold
        ? `Thermal comfort calibrated for ${temp}°C utilizing layered insulation that can be unbuttoned indoors.`
        : `Breathable composition optimized for ${temp}°C ensuring natural airflow throughout the day.`,
    },
    {
      namePrefix: formalityTarget >= 7 ? 'Sleek Modern Sophistication' : 'Effortless Contemporary Ease',
      harmony: 'Analogous cool-toned palette creating an elongating, cohesive runway profile.',
      why: 'Juxtaposes relaxed fabric drape with structured footwear for a polished contemporary balance.',
      weatherReason: `Fabric weight directly accommodates ${temp}°C conditions and ambient humidity.`,
    },
    {
      namePrefix: 'Curated Contrast Silhouette',
      harmony: 'High-contrast complementary tones following the rule of thirds for visual interest.',
      why: 'Dynamic balance between crisp upper lines and versatile lower body geometry.',
      weatherReason: `Weather-resistant transition look engineered for unexpected fluctuations at ${temp}°C.`,
    },
  ];

  return lookArchetypes.map((arch, idx) => {
    const top = sortedTops[idx % Math.max(1, sortedTops.length)] || null;
    const bottom = sortedBottoms[(idx + 1) % Math.max(1, sortedBottoms.length)] || sortedBottoms[0] || null;
    const layer = (isCold || formalityTarget >= 7) && sortedLayers.length > 0 ? sortedLayers[idx % sortedLayers.length] : null;
    const shoe = sortedShoes[idx % Math.max(1, sortedShoes.length)] || sortedShoes[0] || null;
    const accessory = sortedAccessories[idx % Math.max(1, sortedAccessories.length)] || null;

    const palette = [
      top?.color?.hex || '#1e293b',
      bottom?.color?.hex || '#475569',
      layer?.color?.hex || shoe?.color?.hex || '#94a3b8',
    ];

    return {
      outfitName: arch.namePrefix,
      occasion,
      formalityScore: formalityTarget,
      confidenceScore: 88 + (idx === 0 ? 6 : idx === 1 ? 3 : 0),
      slots: {
        topId: top ? String(top._id) : null,
        bottomId: bottom ? String(bottom._id) : null,
        layerId: layer ? String(layer._id) : null,
        shoeId: shoe ? String(shoe._id) : null,
        accessoryIds: accessory ? [String(accessory._id)] : [],
      },
      top,
      bottom,
      layer,
      shoe,
      accessories: accessory ? [accessory] : [],
      colorPalette: palette,
      colorHarmony: arch.harmony,
      whyItWorks: arch.why,
      weatherAdaptation: arch.weatherReason,
      alternatives: [
        {
          slot: 'layer',
          suggestion: layer ? 'Remove layer for indoor climates' : 'Add lightweight trench if outdoor breeze picks up',
          reason: 'Ensures flexibility as temperature shifts throughout the day',
        },
        {
          slot: 'shoe',
          suggestion: shoe ? 'Swap for neutral loafers or clean sneakers' : 'Select structured leather footwear',
          reason: 'Adjusts formality index up or down by 2 points',
        },
      ],
    };
  });
}

/**
 * Generates what-to-buy capsule recommendations when a user's closet is sparse.
 */
function generateCapsuleStarterRecommendations(weather = {}, occasion = 'Everyday') {
  const temp = weather.feelsLike ?? weather.temp ?? 22;
  const isCold = temp < 16;

  return {
    isCapsuleRecommendation: true,
    closetDiagnosis: 'Your wardrobe needs a few foundational staples to unlock unlimited AI styling combinations.',
    weatherPreparedness: `Calibrated for your local climate (${temp}°C, ${weather.condition || 'Clear'})`,
    priorityPurchases: [
      {
        slot: 'top',
        name: isCold ? 'Merino Wool Turtleneck or Heavyweight Cotton Crew' : 'Classic Relaxed Poplin Shirt / Organic Tee',
        priority: 'essential',
        recommendedFabric: isCold ? 'merino wool' : 'cotton',
        recommendedColor: 'Crisp White or Heather Charcoal',
        versatilityReason: 'Forms the anchor of 80% of capsule outfits across both smart and casual aesthetics.',
      },
      {
        slot: 'bottom',
        name: 'Tailored Wide-Leg Trousers or Raw Indigo Denim',
        priority: 'essential',
        recommendedFabric: 'wool blend or heavyweight denim',
        recommendedColor: 'Midnight Navy or Deep Espresso',
        versatilityReason: 'Provides architectural structure that effortlessly pairs with both sneakers and dress footwear.',
      },
      {
        slot: 'layer',
        name: isCold ? 'Double-Breasted Wool Trench or Structured Overcoat' : 'Unstructured Linen/Cotton Blazer',
        priority: 'high',
        recommendedFabric: isCold ? 'wool' : 'linen blend',
        recommendedColor: 'Warm Camel or Slate Black',
        versatilityReason: 'Elevates any basic top and bottom into a cohesive high-fashion look.',
      },
      {
        slot: 'shoe',
        name: isCold ? 'Minimalist Leather Ankle Chelsea Boots' : 'Clean Leather Tennis Sneakers or Penny Loafers',
        priority: 'essential',
        recommendedFabric: 'leather',
        recommendedColor: 'Chalk White or Burnished Black',
        versatilityReason: 'Bridges casual morning transit with evening dinners without feeling out of place.',
      },
    ],
    sampleLooksToAimFor: [
      'The Monochrome Capsule: Tonal charcoal knit + tailored trousers + sleek footwear',
      'The Parisian Casual: Crisp white poplin + dark denim + structured trench coat',
    ],
  };
}

module.exports = {
  scoreGarmentForContext,
  compileFeedbackWeights,
  generateCuratedLooksWithRules,
  generateCapsuleStarterRecommendations,
  COLOR_HARMONY_PALETTES,
};
