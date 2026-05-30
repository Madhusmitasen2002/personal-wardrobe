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
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(helmet());

app.use(morgan('dev'));

app.use(express.json());

app.use(cookieParser(env.cookieSecret));


app.use('/api/auth', authRoutes);

app.use('/api/wardrobe', wardrobeRoutes);

app.use(errorMiddleware);

app.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

module.exports = app;