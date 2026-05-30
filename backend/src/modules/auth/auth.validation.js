const z=require('zod');

const registerSchema=z.object({

 displayName:
    z.string()
     .min(2)
     .max(50),

 email:
    z.email(),

 password:
    z.string()
     .min(8)
     .max(30)

});
const loginSchema=z.object({

    email:
        z.email(),

    password:
        z.string()
        .min(8)
        .max(30)

});

module.exports={
 registerSchema,
 loginSchema
};