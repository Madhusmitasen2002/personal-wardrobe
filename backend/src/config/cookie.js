const env = require('./env');

const refreshTokenCookieOptions = {
  httpOnly: true,

  secure: env.nodeEnv === 'production',

  sameSite: 'strict',

  maxAge: 7 * 24 * 60 * 60 * 1000,
};

module.exports = {
  refreshTokenCookieOptions,
};