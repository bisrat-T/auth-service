const joi=require('joi')

const signupSchema=joi.object({
    
     fullName:joi.string()
    .required(),
    email:joi.string()
    .required()
    .email({
        tlds:{allow:['com', 'net']}
    }),
    password:joi.string()
    .required(),

     phone_number:joi.string()
    .required()
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