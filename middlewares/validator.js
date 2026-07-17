const joi=require('joi')

const signupSchema=joi.object({
    
     firstName:joi.string()
    .required(),

     lastName:joi.string()
    .required(),

    email:joi.string()
    .required()
    .email({
        tlds:{allow:['com', 'net']}
    }),
    
    password:joi.string()
    .required(),

     phone_number:joi.string()
    .required().pattern(/^(?:\+251|251|0)[79]\d{8}$/)
})


const signinSchema=joi.object({
    
 
    email:joi.string()
    .required()
    .email({
        tlds:{allow:['com', 'net']}
    }),
    password:joi.string()
    .required(),
})
 

module.exports={signupSchema, signinSchema}