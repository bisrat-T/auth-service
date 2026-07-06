const mongoose=require('mongoose')

const userSchema=mongoose.Schema({

fullName:{
  type:String,
   required:[true, 'Fullname is required'],
   trim: true
},

email:{
  type:String,
  required:[true, 'Email address is required'],
    unique: [true, 'Email must be unique'],
    lowercase: true,
    trim: true
},

phone_number:{
  type:String,
  required:[true, 'Phone number is required'],
   unique: [true, 'Phone number must be unique'],
  trim: true
},

password:{
  type:String,
  required:[true, 'password is required'],
    unique: true,
    select: false,
    trim: true
},


forgotPassword:{
  type:Number,
  select:false
},

resetPasswordOTP: {
  type: Number
},
resetPasswordOTPExpires: {
  type: Date
}

},{ timestamps:true})

module.exports= mongoose.model('User', userSchema)