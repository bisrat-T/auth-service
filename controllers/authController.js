const jwt = require("jsonwebtoken");
const {signupSchema, signinSchema, otpValidatorSchema} = require("../middlewares/validator");
const userSchema  = require("../models/usersModel");
// const { hash, compare ,genSalt} = require("bcryptjs")
const bcrypt = require("bcryptjs");
const {makeHash, makeHashValidation} = require("../utilities/hash");
const transport = require("../utilities/sendMailer");
const otpSchema= require("../models/otpModel")

const signup=async(req,res)=>{
    const {firstName, lastName,email, password, phone_number,role}=req.body;
   try{
    const {error, value}=signupSchema.validate({firstName, lastName, email,password, phone_number, role })
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
   firstName,
   lastName,
    email,
    password:hashedPassword,
    phone_number, 
    role
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
                role: existingUser.role
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
        const{firstName, lastName, email, phone_number }=req.body

        const updateUser=await userSchema.findByIdAndUpdate(req.user.userID,{firstName, lastName, email, phone_number}, {
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
            message: error.message
        });
}
}


const updateUser=async(req,res)=>{
    try {
        const targetUserId=req.params.id
        const targetUser=await userSchema.findById(targetUserId)

        if(!targetUser){
            return res.status(404).json({
                    success: false,
                message: "User not found"
            })
        }
        if(targetUser.role==="admin" && targetUser._id.toString() !== req.user.userID){
            return res.status(403).json({
                success: false,
                message: "You cannot update another admin"
            });
        }
        const {firstName, lastName,email,phone_number, role}=req.body
        targetUser.firstName=firstName;
        targetUser.lastName=lastName;
        targetUser.email=email;
        targetUser.phone_number=phone_number
        targetUser.role = role;

        await targetUser.save()

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: targetUser
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
        
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
                message: " invalid credentials."
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


const sendVerificationCode = async(req, res)=>{

    const {email}=req.body
    try {
        const existingUser= await userSchema.findOne({email});
        if(!existingUser){
              return res.status(404).json({
                success: false,
                message: "User not found!"
            });
         }

         const otp= Math.floor(100000 + Math.random() * 900000).toString();

         let info=await transport.sendMail({
            from:process.env.EMAIL,
            to:existingUser.email,
            subject:"verification code",
            html:'<h1>'+ otp +'</h1>'
         })

         if(info.accepted[0]===existingUser.email){
            await otpSchema.create({
                userId:existingUser._id,
                otp,
                expiresAt: new Date(Date.now() + 5*60*1000)
            })
         }

           res.status(200).json({
            message: "OTP sent successfully"
        });
        
    } catch (error) {
        console.log(error)
    }
}



const verifyVerificationCode=async(req, res)=>{
    const {email, otp}=req.body
    try {

        const {error, value}=otpValidatorSchema.validate({email, otp})
        
        if(error){
              return res.status(404).json({
                success: false,
           
                message: error.details[0].message
            });
         }
         const otpValue=otp.toString()
        const existingUser=await userSchema.findOne({email})
    //  console.log(existingUser._id)
        if(!existingUser){
              return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }
            const existingOtp= await otpSchema.findOne({userId:existingUser._id})
            //  console.log(existingOtp.otp)
        
            if(!existingOtp){
              return res.status(404).json({
                success: false,
                message: "otp is not found!"
            });
         }
       if (existingOtp.expiresAt < Date.now()) {
    return res.status(400).json({
        success: false,
        message: "OTP has expired!"
    });
}
         console.log(otpValue===existingOtp.otp)
          console.log(otpValue)
          
         if(otpValue===existingOtp.otp){
            // await existingOtp.deleteOne();
            await existingOtp.save()
            return res.status(200).json({success:true, message: 'your account has been verified!'
            })
         }
         else {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
         }

    } catch (error) {
        console.log(error)
    }
}



const forgotPassword=async(req,res)=>{
    try{

        const {email}=req.body
        const user=await userSchema.findOne({email})
        if(!user){
            res.status(400).json("invalid credentials")
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
        message: "invalid credentials"
      });
    }

console.log("Stored OTP:", user.resetPasswordOTP, typeof user.resetPasswordOTP);
console.log("Received OTP:", otp, typeof otp);
console.log("Expires:", user.resetPasswordOTPExpires);
console.log("Now:", Date.now());
const otpFound=(user.resetPasswordOTP === otp)
console.log("otpFound: ",otpFound)



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

module.exports={signup, signin, updateProfile, changePassword, forgotPassword, resetPassword, sendVerificationCode, verifyVerificationCode, updateUser}