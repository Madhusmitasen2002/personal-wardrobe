/**
 * Live Weather Service using Open-Meteo (100% Free, No API key required)
 * Provides real-time temperature, feels-like, precipitation, UV, humidity, wind, and conditions.
 */

const weatherCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const WEATHER_CODE_MAP = {
  0: { label: 'Clear sky', icon: '☀️', condition: 'Clear' },
  1: { label: 'Mainly clear', icon: '🌤️', condition: 'Partly Cloudy' },
  2: { label: 'Partly cloudy', icon: '⛅', condition: 'Partly Cloudy' },
  3: { label: 'Overcast', icon: '☁️', condition: 'Cloudy' },
  45: { label: 'Foggy', icon: '🌫️', condition: 'Fog' },
  48: { label: 'Depositing rime fog', icon: '🌫️', condition: 'Fog' },
  51: { label: 'Light drizzle', icon: '🌦️', condition: 'Drizzle' },
  53: { label: 'Moderate drizzle', icon: '🌧️', condition: 'Drizzle' },
  55: { label: 'Dense drizzle', icon: '🌧️', condition: 'Drizzle' },
  61: { label: 'Slight rain', icon: '🌦️', condition: 'Rain' },
  63: { label: 'Moderate rain', icon: '🌧️', condition: 'Rain' },
  65: { label: 'Heavy rain', icon: '🌧️', condition: 'Heavy Rain' },
  71: { label: 'Slight snow', icon: '🌨️', condition: 'Snow' },
  73: { label: 'Moderate snow', icon: '🌨️', condition: 'Snow' },
  75: { label: 'Heavy snow', icon: '❄️', condition: 'Snow' },
  80: { label: 'Slight rain showers', icon: '🌦️', condition: 'Showers' },
  81: { label: 'Moderate rain showers', icon: '🌧️', condition: 'Showers' },
  82: { label: 'Violent rain showers', icon: '⛈️', condition: 'Showers' },
  95: { label: 'Thunderstorm', icon: '⚡', condition: 'Thunderstorm' },
};

async function getLiveWeather(options = {}) {
  const { city = 'New York', lat, lon } = options;
  const cacheKey = lat && lon ? `${lat.toFixed(2)},${lon.toFixed(2)}` : city.toLowerCase();

  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    let latitude = lat;
    let longitude = lon;
    let cityName = city;

    // If lat/lon not provided, geocode city name
    if (!latitude || !longitude) {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          latitude = geoData.results[0].latitude;
          longitude = geoData.results[0].longitude;
          cityName = `${geoData.results[0].name}, ${geoData.results[0].country_code || ''}`.trim();
        }
      }
    }

    // Default to New York if coordinates could not be resolved
    if (!latitude || !longitude) {
      latitude = 40.7128;
      longitude = -74.006;
      cityName = 'New York, US';
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=uv_index&timezone=auto`;
    const res = await fetch(weatherUrl);

    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const code = current.weather_code ?? 0;
    const conditionInfo = WEATHER_CODE_MAP[code] || { label: 'Clear', icon: '☀️', condition: 'Clear' };

    // Get current hour's UV index if available
    let uvIndex = 4;
    if (data.hourly && Array.isArray(data.hourly.uv_index)) {
      const currentHour = new Date().getHours();
      uvIndex = Math.round(data.hourly.uv_index[currentHour] ?? 4);
    }

    const weatherPayload = {
      city: cityName,
      latitude,
      longitude,
      temp: Math.round(current.temperature_2m ?? 22),
      feelsLike: Math.round(current.apparent_temperature ?? 22),
      humidity: Math.round(current.relative_humidity_2m ?? 50),
      precipitation: Number((current.precipitation ?? 0).toFixed(1)),
      rainProb: current.precipitation > 0 ? 80 : 10,
      windSpeed: Math.round(current.wind_speed_10m ?? 10),
      uvIndex,
      weatherCode: code,
      condition: conditionInfo.condition,
      conditionLabel: conditionInfo.label,
      icon: conditionInfo.icon,
      isRainy: (current.precipitation ?? 0) > 0.5 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code),
      isCold: (current.apparent_temperature ?? 22) < 14,
      isHot: (current.apparent_temperature ?? 22) > 26,
      fetchedAt: new Date().toISOString(),
    };

    weatherCache.set(cacheKey, { timestamp: Date.now(), data: weatherPayload });
    return weatherPayload;
  } catch (err) {
    console.warn('Weather fetch error, using resilient fallback:', err.message);
    const fallback = {
      city: city || 'Local Climate',
      latitude: 40.71,
      longitude: -74.0,
      temp: 22,
      feelsLike: 22,
      humidity: 50,
      precipitation: 0,
      rainProb: 10,
      windSpeed: 10,
      uvIndex: 4,
      weatherCode: 0,
      condition: 'Pleasant',
      conditionLabel: 'Clear and pleasant',
      icon: '☀️',
      isRainy: false,
      isCold: false,
      isHot: false,
      fetchedAt: new Date().toISOString(),
    };
    return fallback;
  }
}

module.exports = {
  getLiveWeather,
};
