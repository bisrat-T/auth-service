const jwt = require("jsonwebtoken");
const {signupSchema, signinSchema} = require("../middlewares/validator");
const userSchema  = require("../models/usersModel");
// const { hash, compare ,genSalt} = require("bcryptjs")
const bcrypt = require("bcryptjs");
const {makeHash, makeHashValidation} = require("../utilities/hash");

const signup=async(req,res)=>{
    const {fullName,email, password, phone_number}=req.body;
   try{
    const {error, value}=signupSchema.validate({email,password, phone_number, fullName})
            if(error){
                return res.status(401).json({success:false, massage:error.details[0].message})
            }
    const existingUser= await userSchema.findOne({email});
            if(existingUser){
                return res.status(401).json({success:false, massage:"User email already exist!"})
            }
            
     const existingPhoneNumber= await userSchema.findOne({phone_number});
            if(existingPhoneNumber){
                return res.status(401).json({success:false, massage:"phone number already exist!"})
            }

    const hashedPassword=await makeHash(password,12)
const newUser= new userSchema({
    fullName,
    email,
    password:hashedPassword,
    phone_number
})
const result=await newUser.save()
result.password=undefined


res.status(200).json({
    success:true,
    message:'Your account has been created successfully!',
    result
})
}
   catch(error){
    console.log(error)
   }
}



const signin=async(req,res)=>{
    const{email, password}=req.body;
    try{
        const{error,value}=signinSchema.validate({email,password});
            if(error){
                return res.status(401).json({success:false, message:error.details[0].message})
            }
            const existingUser=await userSchema.findOne({email}).select('+password')
            if (!existingUser){
                return res.status(401).json({success:false, message:'User does not exist!'})
            }
            const result=await makeHashValidation(password,existingUser.password)
              if(!result){
                return res.status(401).json({success:false, message:'invalid credential'})
              }
              
              const token= jwt.sign({
                userID:existingUser._id,
                email:existingUser.email,
                verfied:existingUser.verfied
              }, process.env.TOKEN_SECRET,{
                expiresIn:'1h'
              })



              res.status(200).json({
                success:true, token, message:"logged in successfully!"
              })
    }
    catch(error){
        console.log(error)
    }
}


const updateProfile =async(req,res)=>{
    try{
        const{fullName, email, phone_number }=req.body

        const updateUser=await userSchema.findByIdAndUpdate(req.user.userID,{fullName, email, phone_number}, {
                new: true,
                runValidators: true
            }, 
        ).select("-password")
    return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: updateUser
})

}
catch(error){
     res.status(500).json({
            message: err.message
        });
}
}


const changePassword=async(req, res)=>{
    try{
        const {currentPassword, newPassword}=req.body
          if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current Password and new Password are required."});
        }
    // const user=await userSchema.findById(req.user.userID)

const user = await userSchema
    .findById(req.user.userID)
    .select("+password");


    if(!user){
         return res.status(404).json({
                success: false,
                message: "User not found."
            });
    }
//       console.log(user);
// console.log(user.password);

    const currentPasswordChecker=await bcrypt.compare(currentPassword, user.password)

if(!currentPasswordChecker){
    return res.status(404).json({
                success: false,
                message: "Current password is incorrect."
            });
}

 const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from the current password."
            });
        }

   const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });


    }
    catch(error){
             console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
    }
}


const forgotPassword=async(req,res)=>{
    try{

        const {email}=req.body
        const user=await userSchema.findOne({email})
        if(!user){
            res.status(400).json("user not found")
        }

        const otp=Math.floor(100000+Math.random()*900000)

          user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;


     await user.save();

    console.log(`OTP for ${email}: ${otp}`);

    return res.status(200).json({
      message: "OTP generated successfully. Check the console."
    });

    }
    catch(error){
      console.log(error)
    }
}


const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

console.log("Stored OTP:", user.resetPasswordOTP, typeof user.resetPasswordOTP);
console.log("Received OTP:", otp, typeof otp);
console.log("Expires:", user.resetPasswordOTPExpires);
console.log("Now:", Date.now());



    if (
      user.resetPasswordOTP !== otp ||
      user.resetPasswordOTPExpires < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "PIN reset successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

module.exports={signup, signin, updateProfile, changePassword, forgotPassword, resetPassword}