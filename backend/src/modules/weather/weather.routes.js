const router = require('express').Router();
const asyncHandler = require('../../middleware/async.middleware');
const ApiResponse = require('../../utils/ApiResponse');
const { getLiveWeather } = require('../../services/weather.service');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { city, lat, lon } = req.query;
    const weather = await getLiveWeather({
      city: city || 'New York',
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
    });

    return res.status(200).json(new ApiResponse(200, weather, 'Live weather retrieved'));
  })
);

module.exports = router;
