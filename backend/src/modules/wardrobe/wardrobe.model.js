const mongoose = require('mongoose');

const wardrobeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['top', 'bottom', 'layer', 'shoe', 'accessory'],
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      default: 'general',
      trim: true,
    },
    length: {
      type: String,
      enum: ['cropped', 'waist', 'hip', 'regular', 'knee', 'midi', 'maxi', 'ankle', 'unspecified'],
      default: 'regular',
    },
    layerType: {
      type: String,
      enum: ['base', 'mid', 'outer', 'unspecified'],
      default: 'unspecified',
    },
    color: {
      name: { type: String, default: 'neutral' },
      hex: { type: String, default: '#64748b' },
      temperature: {
        type: String,
        enum: ['warm', 'cool', 'neutral'],
        default: 'neutral',
      },
    },
    fabric: {
      type: String,
      enum: [
        'cotton',
        'linen',
        'wool',
        'cashmere',
        'silk',
        'polyester',
        'denim',
        'leather',
        'nylon',
        'fleece',
        'knit',
        'blend',
        'other',
      ],
      default: 'other',
    },
    season: {
      type: [String],
      enum: ['spring', 'summer', 'fall', 'winter', 'all_season'],
      default: ['all_season'],
    },
    formality: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    tags: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      required: true,
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    lastWornAt: {
      type: Date,
      default: null,
    },
    wearCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Wardrobe', wardrobeSchema);