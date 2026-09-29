const { z } = require('zod');

const outfitAlternativeSchema = z.object({
  slot: z.string().default('layer'),
  suggestion: z.string().default('Alternative piece'),
  reason: z.string().default('Provides flexibility for weather transitions'),
});

const stylistOutfitSchema = z.object({
  outfitName: z.string().min(1, 'Outfit name required'),
  occasion: z.string().min(1, 'Occasion required'),
  formalityScore: z.number().min(1).max(10).default(5),
  confidenceScore: z.number().min(1).max(100).default(85),
  slots: z.object({
    topId: z.string().nullable().optional().default(null),
    bottomId: z.string().nullable().optional().default(null),
    layerId: z.string().nullable().optional().default(null),
    shoeId: z.string().nullable().optional().default(null),
    accessoryIds: z.array(z.string()).default([]),
  }),
  colorPalette: z.array(z.string()).default(['#1e293b', '#64748b', '#f8fafc']),
  colorHarmony: z.string().default('Balanced tone-on-tone palette using the 60-30-10 color rule'),
  whyItWorks: z.string().default('Proportions and silhouette complement the occasion and body line'),
  weatherAdaptation: z.string().default('Layering and breathable fabric provide thermal comfort'),
  alternatives: z.array(outfitAlternativeSchema).default([]),
});

const stylistResponseSchema = z.array(stylistOutfitSchema);

const capsuleSuggestionSchema = z.object({
  slot: z.string(),
  name: z.string(),
  priority: z.enum(['essential', 'high', 'recommended']).default('essential'),
  recommendedFabric: z.string().default('cotton'),
  recommendedColor: z.string().default('navy or neutral'),
  versatilityReason: z.string(),
});

const capsuleResponseSchema = z.object({
  isCapsuleRecommendation: z.boolean().default(true),
  closetDiagnosis: z.string(),
  priorityPurchases: z.array(capsuleSuggestionSchema),
  weatherPreparedness: z.string(),
  sampleLooksToAimFor: z.array(z.string()).default([]),
});

module.exports = {
  stylistOutfitSchema,
  stylistResponseSchema,
  capsuleSuggestionSchema,
  capsuleResponseSchema,
};
