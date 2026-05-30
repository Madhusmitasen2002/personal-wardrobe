const jwt=require('jsonwebtoken');

const env=require('../../config/env');

const generateAccessToken=(payload)=>{

 return jwt.sign(
    payload,
    env.accessTokenSecret,
    {
      expiresIn:
      env.accessTokenExpiresIn
    }
 );

};

const generateRefreshToken=(payload)=>{

 return jwt.sign(
    payload,
    env.refreshTokenSecret,
    {
      expiresIn:
      env.refreshTokenExpiresIn
    }
 );

};

module.exports={
 generateAccessToken,
 generateRefreshToken
};