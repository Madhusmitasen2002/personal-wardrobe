const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema(
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
    occasion: {
      type: String,
      default: 'Casual',
      trim: true,
    },
    top: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wardrobe',
      default: null,
    },
    bottom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wardrobe',
      default: null,
    },
    layer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wardrobe',
      default: null,
    },
    shoe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wardrobe',
      default: null,
    },
    accessories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wardrobe',
      },
    ],
    colorPalette: {
      type: [String],
      default: [],
    },
    formalityScore: {
      type: Number,
      default: 5,
    },
    confidenceScore: {
      type: Number,
      default: 85,
    },
    weatherSnapshot: {
      temp: Number,
      feelsLike: Number,
      condition: String,
      rainProb: Number,
      uvIndex: Number,
      humidity: Number,
      icon: String,
    },
    stylingAdvice: {
      type: String,
      default: '',
    },
    weatherReasoning: {
      type: String,
      default: '',
    },
    alternatives: [
      {
        slot: String,
        suggestion: String,
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Outfit', outfitSchema);
