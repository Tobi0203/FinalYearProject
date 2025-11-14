const user = require("../models/users");
const bcryptjs=require("bcryptjs");
const jwt=require("jsonwebtoken");
const  transporter = require("../utils/transporter");

const register=async (req,res)=>{
    const {name,email,password}=req.body;
    if(!name || !email || !password){
        return res.json({success:false,message:"require all feilds"});
    }
    const emailExist=await user.findOne({email});
    if(emailExist){
        return res.json({success:false,message:"email already exist"});
    }
    try {
        const hashPass=await bcryptjs.hash(password,10);
        const newUser=new user({name,email,password:hashPass});
        await newUser.save();

        const token=jwt.sign({id:newUser._id},process.env.JWT_SECRET,{expiresIn:"1d"});
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV=='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        })

        const mailOptions={
            from:process.env.EMAIL_USER,
            to:email,
            subject:"welcom to our website",
            text:`welcom to our website.your account has created with email address ${email}`
        }
        await transporter.sendMail(mailOptions);

        return res.json({success:true,message:"user created successfully"});
        
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}
const login=async(req,res)=>{
    const {email,password}=req.body;
    try {
        const exist=await user.findOne({email});
        if(!exist){
            return res.json({success:false,message:"user does not exist"});
        }
        const match=await bcryptjs.compare(password,exist.password);
        // console.log("Compare result:", match);
        if(!match){
            return res.json({success:false,message:"password not match"});
        }
        const token=jwt.sign({id:exist._id},process.env.JWT_SECRET,{expiresIn:"1d"});
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV=='production'?'none':'strict',
            maxAge:7*24*60*60*1000
        })
        return res.json({success:true,message:"login successfully"});

    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}
const logout=async(req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV=='production'?'none':'strict',
        })
        return res.json({success:true,message:"logout successfully"});
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}
const sendVerifyOtp=async(req,res)=>{
    try {
        const userId=req.userId;
        const existUser=await user.findById(userId);
        if(existUser.isVerified){
            return res.json({success:false,message:"user already verified"});
        }
        const otp=String(Math.floor(100000+Math.random()*900000));
        existUser.verifyOtp=otp;
        existUser.verifyOtpExpireAt=Date.now()+10*60*1000;
        await existUser.save();
        // console.log(otp);

        const mailOptions={
            from:process.env.EMAIL_USER,
            to:existUser.email,
            subject:"email verification",
            text:`your verification otp is : ${otp}.otp expires in 10 min.`
        }
        await transporter.sendMail(mailOptions);

        return res.json({success:true,message:"otp send successfully"});

    } catch (error) {
        return res.json({success:false,message:error.message});
    }
    
}
const verifyEmail=async(req,res)=>{
    const userId=req.userId;
    const {otp}=req.body;
    if(!userId || !otp){
        return res.json({success:false,message:"messing details"})
    }
    try {
        const existUser=await user.findById(userId);
        if(!existUser){
            return res.json({success:false,message:"user not found"})
        }
        if(existUser.verifyOtp===''|| existUser.verifyOtp!=otp){
            return res.json({success:false,message:"invalid otp"})
        }
        if(existUser.verifyOtpExpireAt<Date.now()){
            return res.json({success:false,message:"otp expired"})
        }

        existUser.isVerified=true;
        existUser.verifyOtp='';
        existUser.verifyOtpExpireAt=0;
        await existUser.save();
        return res.json({success:true,message:"email veried successfully"});

    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}
const sendResetOtp=async(req,res)=>{
    const {email}=req.body;
    if(!email){
        return res.json({success:false,message:"email is required"});
    }
    try {
        const User=await user.findOne({email});
        if(!User){
            return res.json({success:false,message:"user not found"});
        }
        const otp=String(Math.floor(100000+Math.random()*900000));
        User.resetOtp=otp;
        User.resetOtpExpireAt=Date.now()+5*60*1000;
        await User.save();

        const mailOptions={
            from:process.env.EMAIL_USER,
            to:User.email,
            subject:"Password Reset",
            text:`your password reset otp is ${otp}.otp expires in 5 min`
        }
        await transporter.sendMail(mailOptions);

        return res.json({success:true,message:"reset opt sent successfully"});
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}
const passwordReset=async(req,res)=>{
    const {email,otp,newPassword}=req.body;
    if(!email || !otp || !newPassword){
        return res.json({success:false,message:"messing details"});
    }
    try {
        const existUser=await user.findOne({email});
        if(!existUser){
            return res.json({success:false,message:"user not found"})
        }
        if(existUser.resetOtp===''|| existUser.resetOtp!=otp){
            return res.json({success:false,message:"invalid otp"})
        }
        if(existUser.resetOtpExpireAt<Date.now()){
            return res.json({success:false,message:"otp expired"})
        }
        const hashpass=await bcryptjs.hash(newPassword,10);
        existUser.password=hashpass;
        existUser.resetOtp='';
        existUser.resetOtpExpireAt=0;
        await existUser.save();
        return res.json({success:true,message:"password reset successfully"});
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}
module.exports={register,login,logout,sendVerifyOtp,verifyEmail,sendResetOtp,passwordReset};