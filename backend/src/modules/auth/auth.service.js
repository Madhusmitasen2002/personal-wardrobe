const bcrypt=require('bcryptjs');

const env=require('../../config/env');

const ApiError=require('../../utils/ApiError');

const repository=require('./auth.repository');

const {
 generateAccessToken,
 generateRefreshToken
}=require('./auth.tokens');

const register=async(data)=>{

 const existingUser=
 await repository.findByEmail(
   data.email
 );

 if(existingUser){

   throw new ApiError(
      409,
      'User already exists'
   );

 }

 const hashedPassword=
 await bcrypt.hash(
   data.password,
   env.bcryptSaltRounds
 );

 const user=
 await repository.createUser({

   ...data,
   password:hashedPassword

 });

 const accessToken=
 generateAccessToken({
   userId:user._id
 });

 const refreshToken=
 generateRefreshToken({
   userId:user._id
 });

 return{
    user,
    accessToken,
    refreshToken
 };

};

const login=async(data)=>{

    const user=
    await repository.findByEmail(
        data.email
    );

    if(!user){

        throw new ApiError(
            401,
            'Invalid credentials'
        );

    }

    const isPasswordValid=
    await bcrypt.compare(
        data.password,
        user.password
    );

    if(!isPasswordValid){

        throw new ApiError(
            401,
            'Invalid credentials'
        );

    }

    const accessToken=
    generateAccessToken({

        userId:user._id

    });

    const refreshToken=
    generateRefreshToken({

        userId:user._id

    });

    return{

        user,

        accessToken,

        refreshToken

    };

};

module.exports={register,login};