const dotenv = require('dotenv');

dotenv.config();

const requiredEnvVariables = [
  'PORT',
  'MONGO_URI',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

requiredEnvVariables.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

module.exports = {
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,

  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,

  cookieSecret: process.env.COOKIE_SECRET,

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS),

  cloudinaryCloudName:
process.env.CLOUDINARY_CLOUD_NAME,

cloudinaryApiKey:
process.env.CLOUDINARY_API_KEY,

cloudinaryApiSecret:
process.env.CLOUDINARY_API_SECRET,

  clientUrl: process.env.CLIENT_URL,

  nodeEnv: process.env.NODE_ENV,
};