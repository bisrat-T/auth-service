const jwt = require("jsonwebtoken");

const auth=(req, res, next)=>{
  console.log("<<<<>>>><<<>>",req.headers)
  // const token=req.headers.authorization
const authHeader = req.headers.authorization;
const token = authHeader.split(" ")[1];

if (!token) {
    return res.status(401).json({
        success: false,
        message: "Unauthorized"
    });
}
  // if (!token){
  //   return res.status(403).json({ success:false, message: 'Unauthorized'})
  // }
   
//  git
console.log("Authorization header:", token);
console.log(req.headers);
  try{
  const userToken= token
    const decoded=jwt.verify(userToken, process.env.TOKEN_SECRET);
    // console.log(decoded)
      if(decoded)
      { req.user=decoded;
       next()
    }else{
      throw new Error('error in the token')
    }
 
  }
 catch(error){
  console.log("the errpr:",error)
      res.status(401).json({success:false, massage:"invaliderrr token"})
    }
    }
module.exports=auth;