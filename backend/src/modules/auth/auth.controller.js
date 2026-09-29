const asyncHandler = require('../../middleware/async.middleware');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const service = require('./auth.service');
const { refreshTokenCookieOptions } = require('../../config/cookie');
const User = require('./auth.model');
const cloudinary = require('../../config/cloudinary');
const streamifier = require('streamifier');

const register = asyncHandler(async (req, res) => {
  const result = await service.register(req.body);
  res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      'Registered successfully'
    )
  );
});

const login = asyncHandler(async (req, res) => {
  const result = await service.login(req.body);
  res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      'Login successful'
    )
  );
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, 'User not found'));
  }
  return res.status(200).json(new ApiResponse(200, user, 'Profile fetched'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const {
    displayName,
    avatar,
    stylePreferences,
    fitPreference,
    bodyShape,
    colorSeason,
    culturalConstraints,
  } = req.body;

  const updates = {};
  if (displayName) updates.displayName = displayName.trim();
  if (avatar) updates.avatar = avatar;
  if (stylePreferences) updates.stylePreferences = stylePreferences;
  if (fitPreference) updates.fitPreference = fitPreference;
  if (bodyShape) updates.bodyShape = bodyShape;
  if (colorSeason) updates.colorSeason = colorSeason;
  if (culturalConstraints) updates.culturalConstraints = culturalConstraints;

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $set: updates },
    { new: true }
  ).select('-password');

  return res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { avatar },
    { new: true }
  ).select('-password');

  return res.status(200).json(new ApiResponse(200, user, 'Avatar updated'));
});

const uploadAvatarPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(new ApiResponse(400, null, 'No file uploaded'));
  }

  const uploadPromise = new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'avatars' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });

  const uploadResult = await uploadPromise;
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      'avatar.type': 'photo',
      'avatar.photoUrl': uploadResult.secure_url,
      'avatar.avatarUrl': uploadResult.secure_url,
    },
    { new: true }
  ).select('-password');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Avatar photo uploaded successfully'));
});

const recordFeedback = asyncHandler(async (req, res) => {
  const { outfitId, outfitName, feedbackType, items } = req.body;
  if (!feedbackType) {
    throw new ApiError(400, 'feedbackType is required (liked, disliked, too_formal, too_casual, too_hot, too_cold)');
  }

  const feedbackEntry = {
    outfitId: outfitId || null,
    outfitName: outfitName || 'Custom Look',
    feedbackType,
    items: Array.isArray(items) ? items : [],
    createdAt: new Date(),
  };

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $push: {
        outfitFeedback: {
          $each: [feedbackEntry],
          $slice: -50, // Keep last 50 feedback events
        },
      },
    },
    { new: true }
  ).select('-password');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Feedback logged to preference profile'));
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updateAvatar,
  uploadAvatarPhoto,
  recordFeedback,
};