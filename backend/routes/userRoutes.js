const express=require("express");
const { userData, suggestedUsers } = require("../controllers/userControllers");
const { verifyUser } = require("../middileware/verifyUser");

const userRoutes=express.Router();

userRoutes.get("/userdata",verifyUser,userData);
userRoutes.get("/SuggestedUsers",verifyUser,suggestedUsers);

module.exports=userRoutes;