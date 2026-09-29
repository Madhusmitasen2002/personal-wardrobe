const repository = require('./wardrobe.repository');
const cloudinary = require('../../config/cloudinary');
const streamifier = require('streamifier');
const ApiError = require('../../utils/ApiError');
const { analyzeGarmentImage } = require('../../services/geminiVision.service');

const upload = (userId, file, body) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new ApiError(400, 'Image file is required'));
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'outfits' },
      async (error, result) => {
        if (error) {
          return reject(error);
        }

        try {
          // Parse complex fields if provided as JSON string or array
          let color = { name: 'Neutral', hex: '#64748b', temperature: 'neutral' };
          if (body.color) {
            try {
              color = typeof body.color === 'string' ? JSON.parse(body.color) : body.color;
            } catch {
              color = { name: body.color, hex: body.colorHex || '#64748b', temperature: 'neutral' };
            }
          }

          let season = ['all_season'];
          if (body.season) {
            try {
              season = typeof body.season === 'string' ? JSON.parse(body.season) : body.season;
            } catch {
              season = [body.season];
            }
          }

          let tags = [];
          if (body.tags) {
            try {
              tags = typeof body.tags === 'string' ? JSON.parse(body.tags) : body.tags;
            } catch {
              tags = String(body.tags).split(',').map((t) => t.trim()).filter(Boolean);
            }
          }

          const itemData = {
            userId,
            name: body.name || 'Wardrobe Piece',
            category: body.category || 'top',
            subcategory: body.subcategory || 'general',
            length: body.length || 'regular',
            layerType: body.layerType || (body.category === 'layer' ? 'outer' : 'base'),
            color,
            fabric: body.fabric || 'other',
            season: Array.isArray(season) ? season : ['all_season'],
            formality: Number(body.formality) || 5,
            tags: Array.isArray(tags) ? tags : [],
            brand: body.brand || '',
            imageUrl: result.secure_url,
            cloudinaryId: result.public_id,
          };

          const item = await repository.createItem(itemData);
          resolve(item);
        } catch (dbErr) {
          reject(dbErr);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

const analyze = async (file, hintName = '') => {
  if (!file) {
    throw new ApiError(400, 'Image file is required for analysis');
  }
  return await analyzeGarmentImage(file.buffer, file.mimetype, hintName);
};

const getMyItems = async (userId) => {
  return await repository.getItemsByUser(userId);
};

const getItem = async (itemId, userId) => {
  const item = await repository.getItemById(itemId, userId);
  if (!item) {
    throw new ApiError(404, 'Item not found');
  }
  return item;
};

const updateItem = async (itemId, userId, data) => {
  const updatedItem = await repository.updateItem(itemId, userId, data);
  if (!updatedItem) {
    throw new ApiError(404, 'Item not found');
  }
  return updatedItem;
};

const deleteItem = async (itemId, userId) => {
  const item = await repository.getItemById(itemId, userId);
  if (!item) {
    throw new ApiError(404, 'Item not found');
  }

  if (item.cloudinaryId) {
    try {
      await cloudinary.uploader.destroy(item.cloudinaryId);
    } catch (err) {
      console.warn('Failed to delete image from Cloudinary:', err.message);
    }
  }

  return await repository.deleteItem(itemId, userId);
};

module.exports = {
  upload,
  analyze,
  getMyItems,
  getItem,
  updateItem,
  deleteItem,
};