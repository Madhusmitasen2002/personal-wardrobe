const asyncHandler = require('../../middleware/async.middleware');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const Outfit = require('./outfit.model');
const stylistService = require('./stylist.service');

const createOutfit = asyncHandler(async (req, res) => {
  const {
    name,
    occasion,
    top,
    bottom,
    layer,
    shoe,
    accessories,
    colorPalette,
    formalityScore,
    weatherSnapshot,
    stylingAdvice,
    weatherReasoning,
    alternatives,
  } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Outfit name is required');
  }

  const outfit = await Outfit.create({
    userId: req.user.userId,
    name: name.trim(),
    occasion: occasion || 'Casual',
    top: top || null,
    bottom: bottom || null,
    layer: layer || null,
    shoe: shoe || null,
    accessories: Array.isArray(accessories) ? accessories : [],
    colorPalette: Array.isArray(colorPalette) ? colorPalette : [],
    formalityScore: formalityScore || 5,
    weatherSnapshot: weatherSnapshot || null,
    stylingAdvice: stylingAdvice || '',
    weatherReasoning: weatherReasoning || '',
    alternatives: Array.isArray(alternatives) ? alternatives : [],
  });

  const populated = await Outfit.findById(outfit._id)
    .populate('top')
    .populate('bottom')
    .populate('layer')
    .populate('shoe')
    .populate('accessories');

  return res
    .status(201)
    .json(new ApiResponse(201, populated, 'Outfit saved to your runway collection'));
});

const getMyOutfits = asyncHandler(async (req, res) => {
  const outfits = await Outfit.find({ userId: req.user.userId })
    .sort({ createdAt: -1 })
    .populate('top')
    .populate('bottom')
    .populate('layer')
    .populate('shoe')
    .populate('accessories');

  return res
    .status(200)
    .json(new ApiResponse(200, outfits, 'Outfits retrieved successfully'));
});

const deleteOutfit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Outfit.findOneAndDelete({
    _id: id,
    userId: req.user.userId,
  });

  if (!deleted) {
    throw new ApiError(404, 'Outfit not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deleted, 'Outfit deleted successfully'));
});

const askAiStylist = asyncHandler(async (req, res) => {
  const { prompt, occasion, city, lat, lon } = req.body;
  const result = await stylistService.generateStylistOutfits(req.user.userId, {
    prompt,
    occasion,
    city,
    lat,
    lon,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        result.isCapsuleRecommendation
          ? 'Capsule wardrobe starter recommendations generated'
          : 'Personal stylist recommendations generated successfully'
      )
    );
});

module.exports = {
  createOutfit,
  getMyOutfits,
  deleteOutfit,
  askAiStylist,
};
