const express=require("express");
const { userData } = require("../controllers/userControllers");
const { verifyUser } = require("../middileware/verifyUser");

const userRoutes=express.Router();

userRoutes.get("/userdata",verifyUser,userData);

module.exports=userRoutes;