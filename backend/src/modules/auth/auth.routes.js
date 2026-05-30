const router=
require('express').Router();

const controller=
require('./auth.controller');

const validate=
require('../../middleware/validate.middleware');

const {
 registerSchema
}=require('./auth.validation');
const authMiddleware =
require(
'../../middleware/auth.middleware'
);

router.get(

'/protected',

authMiddleware,

(req,res)=>{

res.json({

success:true,

message:
'Protected route',

user:req.user

});

});

const{
loginSchema
}=require(
'./auth.validation'
);


router.post(
 '/register',
 validate(registerSchema),
 controller.register
);


router.post(

'/login',

validate(
loginSchema
),

controller.login

);
module.exports=router;