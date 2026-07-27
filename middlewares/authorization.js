const jwt = require("jsonwebtoken");

const auth=(req, res, next)=>{
  const token=req.headers.authorization

console.log("Authorization header:", token);


  if (!token){
    return res.status(403).json({ success:false, message: 'Unauthorized'})
  }
   
//  git
  try{
  const userToken= token.split(' ')[1]
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
      res.status(401).json({success:false, massage:"invalide token"})
    }
    }
module.exports=auth;