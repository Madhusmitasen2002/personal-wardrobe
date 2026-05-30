const asyncHandler=
require('../../middleware/async.middleware');

const ApiResponse=
require('../../utils/ApiResponse');

const service=
require('./auth.service');

const {
refreshTokenCookieOptions
}=require('../../config/cookie');

const register=asyncHandler(
 async(req,res)=>{

 const result=
 await service.register(
    req.body
 );

 res.cookie(
   'refreshToken',
   result.refreshToken,
   refreshTokenCookieOptions
 );

 return res
 .status(201)
 .json(

 new ApiResponse(
   201,
   {
      user:result.user,
      accessToken:
      result.accessToken
   },
   'Registered successfully'
 )

 );

});
const login=asyncHandler(

async(req,res)=>{

const result=
await service.login(
    req.body
);

res.cookie(
   'refreshToken',
   result.refreshToken,
   refreshTokenCookieOptions
);

return res
.status(200)
.json(

new ApiResponse(

200,

{

user:result.user,

accessToken:
result.accessToken

},

'Login successful'

)

);

});

module.exports={register,login};