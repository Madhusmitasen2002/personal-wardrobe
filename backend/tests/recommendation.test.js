const { test, describe } = require('node:test');
const assert = require('node:assert');
const {
  scoreGarmentForContext,
  compileFeedbackWeights,
  generateCuratedLooksWithRules,
  generateCapsuleStarterRecommendations,
} = require('../src/modules/outfit/fashionRules');
const {
  stylistResponseSchema,
  stylistOutfitSchema,
} = require('../src/modules/outfit/stylist.validation');

describe('Fashion AI Stylist & Recommendation Logic Tests', () => {
  // Mock wardrobe items
  const mockWoolCoat = {
    _id: 'coat123',
    name: 'Camel Wool Overcoat',
    category: 'layer',
    subcategory: 'coat',
    length: 'knee',
    layerType: 'outer',
    fabric: 'wool',
    formality: 8,
    color: { name: 'Camel', hex: '#d97706' },
  };

  const mockLinenTee = {
    _id: 'tee123',
    name: 'Breezy Linen T-Shirt',
    category: 'top',
    subcategory: 't-shirt',
    length: 'regular',
    layerType: 'base',
    fabric: 'linen',
    formality: 4,
    color: { name: 'White', hex: '#ffffff' },
  };

  const mockBoots = {
    _id: 'boot123',
    name: 'Leather Chelsea Boots',
    category: 'shoe',
    subcategory: 'boots',
    fabric: 'leather',
    formality: 7,
    color: { name: 'Black', hex: '#0f172a' },
  };

  const mockSuedeSandals = {
    _id: 'sandal123',
    name: 'Suede Strappy Sandals',
    category: 'shoe',
    subcategory: 'sandals',
    fabric: 'suede',
    formality: 5,
    color: { name: 'Tan', hex: '#d97706' },
  };

  const mockJeans = {
    _id: 'jean123',
    name: 'Raw Denim Indigo Trousers',
    category: 'bottom',
    subcategory: 'jeans',
    fabric: 'denim',
    formality: 5,
    color: { name: 'Indigo', hex: '#1e3a8a' },
  };

  test('Temperature Rule: Cold weather (< 10°C) scores heavy wool coat higher than light linen', () => {
    const coldWeather = { temp: 5, feelsLike: 3, isRainy: false };
    const coatScore = scoreGarmentForContext(mockWoolCoat, { weather: coldWeather });
    const linenScore = scoreGarmentForContext(mockLinenTee, { weather: coldWeather });

    assert.ok(coatScore > linenScore, `Wool coat score (${coatScore}) should exceed linen score (${linenScore}) in cold`);
  });

  test('Temperature Rule: Hot weather (> 24°C) penalizes wool coat and favors breathable linen', () => {
    const hotWeather = { temp: 28, feelsLike: 30, isRainy: false };
    const coatScore = scoreGarmentForContext(mockWoolCoat, { weather: hotWeather });
    const linenScore = scoreGarmentForContext(mockLinenTee, { weather: hotWeather });

    assert.ok(linenScore > coatScore, `Linen score (${linenScore}) should exceed wool coat score (${coatScore}) in hot weather`);
  });

  test('Rain Defense Rule: Rainy weather penalizes suede footwear and favors leather boots', () => {
    const rainyWeather = { temp: 15, feelsLike: 14, isRainy: true, precipitation: 4.5 };
    const bootsScore = scoreGarmentForContext(mockBoots, { weather: rainyWeather });
    const sandalsScore = scoreGarmentForContext(mockSuedeSandals, { weather: rainyWeather });

    assert.ok(bootsScore > sandalsScore, `Leather boots (${bootsScore}) should be preferred over suede sandals (${sandalsScore}) in rain`);
  });

  test('Formality Target: Executive target (formality 8) scores tailored wool coat higher than casual tee', () => {
    const formalContext = { weather: { temp: 20 }, formalityTarget: 8 };
    const coatScore = scoreGarmentForContext(mockWoolCoat, formalContext);
    const teeScore = scoreGarmentForContext(mockLinenTee, formalContext);

    assert.ok(coatScore > teeScore, `Formality matching should favor coat (${coatScore}) over tee (${teeScore}) for formal occasions`);
  });

  test('Feedback Loop: User dislike history penalizes disliked items', () => {
    const feedbackList = [
      { feedbackType: 'disliked', items: [{ slot: 'layer', name: 'Camel Wool Overcoat' }] },
    ];
    const weights = compileFeedbackWeights(feedbackList);
    assert.strictEqual(weights.layer < 0, true, 'Layer slot should receive negative weight from dislike');

    const scoreWithDislike = scoreGarmentForContext(mockWoolCoat, {
      weather: { temp: 8 },
      feedbackWeights: weights,
    });
    const scoreWithoutDislike = scoreGarmentForContext(mockWoolCoat, {
      weather: { temp: 8 },
      feedbackWeights: {},
    });

    assert.ok(scoreWithDislike < scoreWithoutDislike, 'Disliked item should receive a lower contextual score');
  });

  test('Capsule Wardrobe Generator: Recommends essential staples when closet is sparse', () => {
    const capsule = generateCapsuleStarterRecommendations({ temp: 12, condition: 'Chilly' }, 'Work');
    assert.strictEqual(capsule.isCapsuleRecommendation, true);
    assert.ok(capsule.priorityPurchases.length >= 4, 'Should recommend at least 4 foundation pieces');

    const slots = capsule.priorityPurchases.map((p) => p.slot);
    assert.ok(slots.includes('top'));
    assert.ok(slots.includes('bottom'));
    assert.ok(slots.includes('layer'));
    assert.ok(slots.includes('shoe'));
  });

  test('Zod Schema Validation: Validates structured LLM stylist output schema', () => {
    const validOutfit = {
      outfitName: 'The Architectural Executive',
      occasion: 'Job Interview',
      formalityScore: 8,
      confidenceScore: 94,
      slots: {
        topId: 'top123',
        bottomId: 'bottom123',
        layerId: 'layer123',
        shoeId: 'shoe123',
        accessoryIds: ['acc123'],
      },
      colorPalette: ['#1e293b', '#d97706', '#f8fafc'],
      colorHarmony: '60% navy foundation with 30% camel structure and 10% cream balance',
      whyItWorks: 'Crisp lapel contours establish immediate polish while trousers elongate the line',
      weatherAdaptation: 'Double-faced wool provides optimal thermal insulation at 12°C',
      alternatives: [
        { slot: 'layer', suggestion: 'Unbutton coat indoors', reason: 'Indoor climate control' },
        { slot: 'shoe', suggestion: 'Swap heels for loafers', reason: 'Comfort during commute' },
      ],
    };

    const parsed = stylistOutfitSchema.safeParse(validOutfit);
    assert.strictEqual(parsed.success, true, 'Valid outfit should pass Zod validation');
  });

  test('Zod Schema Validation: Rejects malformed outfit missing required fields', () => {
    const invalidOutfit = {
      // Missing outfitName and occasion
      formalityScore: 8,
    };

    const parsed = stylistOutfitSchema.safeParse(invalidOutfit);
    assert.strictEqual(parsed.success, false, 'Invalid outfit must fail Zod validation');
  });

  test('Curated Looks Generator: Produces multi-slot coordinated outfits with color palettes and alternatives', () => {
    const items = [mockWoolCoat, mockLinenTee, mockBoots, mockJeans];
    const looks = generateCuratedLooksWithRules(items, {
      occasion: 'Smart Casual Dinner',
      weather: { temp: 14, feelsLike: 13, isRainy: false },
    });

    assert.strictEqual(looks.length, 3, 'Should generate 3 distinct curated looks');
    const firstLook = looks[0];
    assert.ok(firstLook.top, 'Look must have a top');
    assert.ok(firstLook.bottom, 'Look must have a bottom');
    assert.ok(firstLook.shoe, 'Look must have footwear');
    assert.ok(firstLook.colorPalette.length >= 2, 'Look must have a defined color palette');
    assert.ok(firstLook.alternatives.length === 2, 'Look must provide 2 weather/formality alternatives');
  });
});
