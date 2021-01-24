const jwt=require("jsonwebtoken");
const Teacher=require("../models/teacher");

const auth=async (req,res,next)=>{
    try{
      const token=req.header('Authorization');
      if(!token){
        res.status(401).json({msg:'No token, access Denied'})
      }
      const decoded=await jwt.verify(token,process.env.TOKEN);
      const teacher=await Teacher.findOne({_id:decoded._id,'tokens.token':token});
      if(!teacher){
        res.status(400).json({msg:"Authenticate as a teacher to proceed furthur!!"});
      }
      req.teacher=teacher;
      req.token=token;
      next();
    }
    catch(error){
     res.status(401).json({msg:'Invalid token'});
    }
}
module.exports=auth;
