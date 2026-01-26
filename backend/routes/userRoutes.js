const express = require("express");
const { suggestedUsers, currentUser, getUserProfile, toggleFollow, blockUser,getBlockedUsers, searchUser, getFollowing, getFollowers, removeFollower, updateProfile, removeProfilePicture, acceptFollowRequest, declineFollowRequest } = require("../controllers/userControllers");
const { verifyUser } = require("../middleware/verifyUser");
const { checkBlock } = require("../middleware/checkBlock");
const profileUpload = require("../utils/profileUplode");

const userRoutes = express.Router();

userRoutes.get("/SuggestedUsers", verifyUser, suggestedUsers);
userRoutes.get("/current", verifyUser, currentUser)
userRoutes.get("/profile/:userId", verifyUser, checkBlock, getUserProfile)
userRoutes.get("/following/:userId", verifyUser, checkBlock, getFollowing);
userRoutes.get("/followers/:userId", verifyUser, checkBlock, getFollowers);
userRoutes.put("/toggleFollow/:userId", verifyUser, checkBlock, toggleFollow)
userRoutes.put("/block/:userId", verifyUser, blockUser);
userRoutes.get("/blocked", verifyUser, getBlockedUsers);
userRoutes.post("/follow/accept/:userId", verifyUser, checkBlock, acceptFollowRequest);
userRoutes.post("/follow/decline/:userId", verifyUser, checkBlock, declineFollowRequest);
userRoutes.put("/removeFollower/:followerId", verifyUser, checkBlock, removeFollower);
userRoutes.get("/searchUsers", verifyUser, searchUser);
userRoutes.put("/updateProfile", verifyUser, profileUpload.single("profilePicture"), updateProfile);
userRoutes.put("/removeProfilePicture", verifyUser, removeProfilePicture)

module.exports = userRoutes;