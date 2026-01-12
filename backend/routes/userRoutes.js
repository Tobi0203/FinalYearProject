const express = require("express");
const { suggestedUsers, currentUser, getUserProfile, toggleFollow, searchUser, getFollowing, getFollowers, removeFollower, updateProfile, removeProfilePicture, acceptFollowRequest, declineFollowRequest } = require("../controllers/userControllers");
const { verifyUser } = require("../middileware/verifyUser");
const profileUpload = require("../utils/profileUplode");

const userRoutes = express.Router();

userRoutes.get("/SuggestedUsers", verifyUser, suggestedUsers);
userRoutes.get("/current", verifyUser, currentUser)
userRoutes.get("/profile/:userId", verifyUser, getUserProfile)
userRoutes.get("/following/:userId",verifyUser,getFollowing);
userRoutes.get("/followers/:userId",verifyUser,getFollowers);
userRoutes.put("/toggleFollow/:userId", verifyUser, toggleFollow)
userRoutes.post("/follow/accept/:userId", verifyUser, acceptFollowRequest);
userRoutes.post("/follow/decline/:userId", verifyUser, declineFollowRequest);
userRoutes.put("/removeFollower/:followerId",verifyUser,removeFollower);
userRoutes.get("/searchUsers", verifyUser, searchUser);
userRoutes.put("/updateProfile",verifyUser,profileUpload.single("profilePicture"),updateProfile);
userRoutes.put("/removeProfilePicture",verifyUser,removeProfilePicture)

module.exports = userRoutes;