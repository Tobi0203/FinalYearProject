const express=require("express");
const {register, login, logout , sendVerifyOtp, verifyEmail, sendResetOtp, passwordReset} = require("../controllers/authControllers");
const { verifyUser } = require("../middileware/verifyUser");

const authRoutes=express.Router();

authRoutes.post("/register",register);
authRoutes.post("/login",login);
authRoutes.post("/logout",logout);
authRoutes.post("/sendVerifyOtp",verifyUser,sendVerifyOtp);
authRoutes.post("/verifyEmail",verifyUser,verifyEmail);
authRoutes.post("/sendResetOtp",sendResetOtp);
authRoutes.post("/passwordReset",passwordReset);

module.exports=authRoutes;