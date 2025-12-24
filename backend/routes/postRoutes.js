const express=require("express");
const { allPosts, createPost } = require("../controllers/postControllers");
const { verifyUser } = require("../middileware/verifyUser");
const upload = require("../utils/multer");

const postRoutes=express.Router();

postRoutes.get("/allPosts",verifyUser,allPosts);
postRoutes.post("/createPost",verifyUser,upload.single("media"),createPost);

module.exports=postRoutes;