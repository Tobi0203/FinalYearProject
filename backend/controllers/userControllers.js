const user = require("../models/users");

const userData=async (req,res)=>{
    const userId=req.userId;
    if(!userId){
        return res.json({success:false,message:"user not logged in"});
    }
    try {
        const existUser=await user.findById(userId).select("-password");
        if(!existUser){
            return res.json({success:false,message:"user not found"});
        }

        return res.json({success:true,user:existUser,message:"user data found"})
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}
const suggestedUsers=async (req,res)=>{
    const userId=req.user.id;
    if(!userId){
        return res.json({success:false,message:"user not logged in"});
    }
    try {
        const suggUsers=await user.find({_id:{$ne:req.user.id}}).select("-password");
        if(!suggUsers){
            return res.json({success:false,message:"no user regestred"});
        }        
        return res.json({success:true,users:suggUsers,message:"Users found"});
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}
const currentUser=async (req,res)=>{
    try {
        const curUser=await user.findById(req.user).select("_id username email profilePic");
        if(!curUser){
             return res.json({success:false,message:"user not found"});
        }
        return res.json({success:true,message:"current user found",user:curUser})
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}

module.exports={userData,suggestedUsers,currentUser};