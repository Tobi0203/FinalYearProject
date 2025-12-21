const jwt=require('jsonwebtoken');

const verifyUser=async(req,res,next)=>{
    const token=req.cookies.token;
    if(!token){
        return res.json({success:false,message:"user not authorized1"});
    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        if(decoded.id){
            req.user={id:decoded.id};
        }
        else{
            return res.json({success:false,message:"user not authorized"});
        }
        next();
    } catch (error) {
        console.log(error.message)
        return res.json({success:false,message:error.message});
    }
}
module.exports={verifyUser};