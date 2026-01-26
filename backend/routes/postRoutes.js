const express = require("express");
const { allPosts,getSinglePost, createPost, toggleLike, tooglesaved, addComment, followingFeed, deletePost, editPost, deleteComment, getSavedPosts, getLikedPosts, getUserPosts } = require("../controllers/postControllers");
const { verifyUser } = require("../middleware/verifyUser");
const { checkBlock } = require("../middleware/checkBlock");
const upload = require("../utils/multer");

const postRoutes = express.Router();

postRoutes.get("/allPosts", verifyUser, allPosts);
postRoutes.get("/userPosts/:userId", verifyUser, checkBlock, getUserPosts)
postRoutes.post("/createPost", verifyUser, upload.array("media", 5), createPost);
postRoutes.put("/toggleLike/:postId", verifyUser, checkBlock, toggleLike);
postRoutes.get("/likedPosts", verifyUser, getLikedPosts);
postRoutes.put("/toggleSave/:postId", verifyUser, checkBlock, tooglesaved)
postRoutes.get("/savedPosts", verifyUser, getSavedPosts);
postRoutes.post("/addComment/:postId", verifyUser, checkBlock, addComment)
postRoutes.delete("/deleteComment/:postId/:commentId", verifyUser, checkBlock, deleteComment)
postRoutes.get("/followingFeeds", verifyUser, followingFeed)
postRoutes.delete("/deletePost/:postId", verifyUser, deletePost)
postRoutes.put("/editPost/:postId", verifyUser, upload.single("media"), editPost);
postRoutes.get("/:postId", verifyUser, checkBlock, getSinglePost);


module.exports = postRoutes;