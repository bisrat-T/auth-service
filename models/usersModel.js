const mongoose=require('mongoose')

const userSchema=mongoose.Schema({

firstName:{
  type:String,
   required:[true, 'Fullname is required'],
   trim: true
},
lastName:{
  type:String,
   required:[true, 'Fullname is required'],
   trim: true
},

email:{
  type:String,
  required:[true, 'Email address is required'],
    unique: [true, 'Email already exist'],
    lowercase: true,
    trim: true
},

phone_number:{
  type:String,
  required:[true, 'Phone number is required'],
   unique: [true, 'Phone number already exist'],
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
  type: String
},
resetPasswordOTPExpires: {
  type: Date
}

},{ timestamps:true})

module.exports= mongoose.model('User', userSchema)