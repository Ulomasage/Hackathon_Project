const jwt=require("jsonwebtoken")
const UserModel=require("../models/userModel")
require("dotenv").config()

exports.authentication=async(req,res)=>{
    try {
       const auth=req.headers.authorization;
       if(!auth){
        return res.status(401).json({message:"see admin for authorization"})
       } 
       const token=auth.split("")[1]
       if(!token){
        return res.status(400).json({message:"invalid token"})
       }
       const decodeToken=jwt.verify(token,process.env.JWT_SECRET)
       const user=await UserModel.findById( decodeToken.userId)
       if(!user){
        return res.status(400).json({message:"authentication failed: user not found"})
       }
       if(user.blackList.includes(token)){
        return res.status(401).json({message:"session expired: please login to continue"})
       }
       req.user=decodeToken
       next()

    } catch (error) {
        if(error instanceof jwt.JsonWebTokenError){
            return res.json({message:"section timeout"})
        }
        res.status(500).json(error.message)
    }
}


exports.isAdmin = async (req, res, next) => {
    try {
      if (req.user.isAdmin) {
        next();
      } else {
        res.status(403).json({ message: "Unauthorized: Not an admin" });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };