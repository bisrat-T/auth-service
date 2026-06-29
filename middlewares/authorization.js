const jwt = require("jsonwebtoken");

const auth=(req, res, next)=>{
  const token=req.header("Authorization")


// console.log("Authorization header:", token);


  if (!token){
    return res.status(403).json({ success:false, message: 'Unauthorized'})
  }

 
  try{
  
    const decoded=jwt.verify(token, process.env.TOKEN_SECRET);
    // console.log(decoded)

       req.user=decoded;
       next()
    }
 
 
 catch(error){
      res.status(401).json({success:false, massage:"invalide token"})
    }
    }
module.exports=auth;