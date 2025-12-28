const express=require("express");
const { allPosts, createPost, toggleLike, tooglesaved, addComment, followingFeed, deletePost, editPost } = require("../controllers/postControllers");
const { verifyUser } = require("../middileware/verifyUser");
const upload = require("../utils/multer");

const postRoutes=express.Router();

postRoutes.get("/allPosts",verifyUser,allPosts);
postRoutes.post("/createPost",verifyUser,upload.single("media"),createPost);
postRoutes.put("/toggleLike/:postId",verifyUser,toggleLike);
postRoutes.put("/toggleSaved/:postId",verifyUser,tooglesaved)
postRoutes.post("/comment/:postId",verifyUser,addComment)
postRoutes.get("/followingFeeds",verifyUser,followingFeed)
postRoutes.delete("/deletePost/:posId",verifyUser,deletePost)
postRoutes.put("/editPost/:postId",verifyUser,editPost);


module.exports=postRoutes;