const joi=require('joi')

const signupSchema = joi.object({
  firstName: joi.string().required(),

  lastName: joi.string().required(),

  email: joi
    .string()
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),

  password: joi.string().required(),

  phone_number: joi
    .string()
    .required()
    .pattern(/^(?:\+251|0)(?:9|7)\d{8}$/)
    .messages({
      "string.pattern.base":
        "Please provide a valid Ethiopian phone number (e.g., 0911223344 or +251712345678).",
    }),
  role: joi.string().optional(),
});
     


const signinSchema=joi.object({
    
 
    email:joi.string()
    .required()
    .email({
        tlds:{allow:['com', 'net']},
       
    })
       .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) // Your custom pattern
    .messages({
      'string.pattern.base': 'Email format is invalid.',
      'string.email': 'Email must end in .com or .net'
    }),
    password:joi.string()
    .required(),
})
 
const otpValidatorSchema=joi.object({
     email:joi.string()
    .required()
    .email({
        tlds:{allow:['com', 'net']}
    }),
    otp:joi.number()
    .required(),
})
module.exports={signupSchema, signinSchema, otpValidatorSchema}