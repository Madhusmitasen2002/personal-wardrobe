const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: {
        type: String,
        enum: ['preset', 'custom', 'photo'],
        default: 'preset',
      },
      presetId: {
        type: String,
        default: 'chic-female',
      },
      skinTone: {
        type: String,
        default: '#f3c7a2',
      },
      skinUndertone: {
        type: String,
        enum: ['warm', 'cool', 'neutral'],
        default: 'warm',
      },
      hairColor: {
        type: String,
        default: '#2c1b18',
      },
      hairStyle: {
        type: String,
        default: 'long',
      },
      gender: {
        type: String,
        default: 'female',
      },
      proportions: {
        shoulders: { type: Number, default: 50 },
        waist: { type: Number, default: 50 },
        hips: { type: Number, default: 50 },
        heightScale: { type: Number, default: 1.0 },
      },
      avatarUrl: {
        type: String,
        default: '',
      },
      photoUrl: {
        type: String,
        default: '',
      },
    },
    stylePreferences: {
      type: [String],
      default: ['casual', 'minimalist'],
    },
    fitPreference: {
      type: String,
      enum: ['slim', 'regular', 'relaxed', 'oversized'],
      default: 'regular',
    },
    bodyShape: {
      type: String,
      enum: ['hourglass', 'pear', 'rectangle', 'inverted_triangle', 'athletic', 'unspecified'],
      default: 'unspecified',
    },
    colorSeason: {
      type: String,
      enum: ['deep_autumn', 'warm_spring', 'cool_winter', 'soft_summer', 'neutral'],
      default: 'neutral',
    },
    culturalConstraints: {
      type: [String],
      default: [],
    },
    outfitFeedback: [
      {
        outfitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Outfit' },
        outfitName: String,
        feedbackType: {
          type: String,
          enum: ['liked', 'disliked', 'too_formal', 'too_casual', 'too_hot', 'too_cold'],
          required: true,
        },
        items: [
          {
            slot: String,
            name: String,
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);