const express=require("express");
const { allPosts, createPost, toggleLike, tooglesaved, addComment, followingFeed, deletePost, editPost, deleteComment, getSavedPosts, getLikedPosts } = require("../controllers/postControllers");
const { verifyUser } = require("../middileware/verifyUser");
const upload = require("../utils/multer");

const postRoutes=express.Router();

postRoutes.get("/allPosts",verifyUser,allPosts);
postRoutes.post("/createPost",verifyUser,upload.single("media"),createPost);
postRoutes.put("/toggleLike/:postId",verifyUser,toggleLike);
postRoutes.get("/likedPosts",verifyUser,getLikedPosts);
postRoutes.put("/toggleSave/:postId",verifyUser,tooglesaved)
postRoutes.get("/savedPosts",verifyUser,getSavedPosts);
postRoutes.post("/addComment/:postId",verifyUser,addComment)
postRoutes.delete("/deleteComment/:postId/:commentId",verifyUser,deleteComment)
postRoutes.get("/followingFeeds",verifyUser,followingFeed)
postRoutes.delete("/deletePost/:postId",verifyUser,deletePost)
postRoutes.put("/editPost/:postId",verifyUser,editPost);


module.exports=postRoutes;