const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');

const app = express();

const authRoutes = require('./modules/auth/auth.routes');
const errorMiddleware = require('./middleware/error.middleware');
const wardrobeRoutes = require('./modules/wardrobe/wardrobe.routes');

console.log(process.env.CLIENT_URL);
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://personal-wardrobe-fawn.vercel.app',
  ...(env.clientUrl ? [env.clientUrl] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(morgan('dev'));

app.use(express.json());

app.use(cookieParser(env.cookieSecret));

const outfitRoutes = require('./modules/outfit/outfit.routes');
const weatherRoutes = require('./modules/weather/weather.routes');

app.use('/api/auth', authRoutes);

app.use('/api/wardrobe', wardrobeRoutes);

app.use('/api/outfits', outfitRoutes);

app.use('/api/weather', weatherRoutes);


app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Outfit API is running smoothly',
  });
});

app.use(errorMiddleware);

module.exports = app;