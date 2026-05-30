const User=require('./auth.model');

const findByEmail=(email)=>{
   return User.findOne({email});
};

const createUser=(data)=>{
   return User.create(data);
};

module.exports={
   findByEmail,
   createUser
};