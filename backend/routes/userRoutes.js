const express=require("express");
const { userData, suggestedUsers, currentUser } = require("../controllers/userControllers");
const { verifyUser } = require("../middileware/verifyUser");

const userRoutes=express.Router();

userRoutes.get("/userdata",verifyUser,userData);
userRoutes.get("/SuggestedUsers",verifyUser,suggestedUsers);
userRoutes.get("/current",verifyUser,currentUser)

module.exports=userRoutes;