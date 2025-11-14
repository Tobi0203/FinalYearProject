const user = require("../models/users");

const userData=async (req,res)=>{
    const userId=req.userId;
    if(!userId){
        return res.json({success:false,message:"user not logged in"});
    }
    try {
        const existUser=await user.findById(userId);
        if(!existUser){
            return res.json({success:false,message:"user not found"});
        }

        return res.json({success:true,user:existUser,message:"user data found"})
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}

module.exports={userData}