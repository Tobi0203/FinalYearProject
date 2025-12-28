const express = require("express");
const { suggestedUsers, currentUser, getUserProfile, toggleFollow, searchUser } = require("../controllers/userControllers");
const { verifyUser } = require("../middileware/verifyUser");

const userRoutes = express.Router();

userRoutes.get("/SuggestedUsers", verifyUser, suggestedUsers);
userRoutes.get("/current", verifyUser, currentUser)
userRoutes.get("/profile/:userId", verifyUser, getUserProfile)
userRoutes.put("/toggleFollow/:userId", verifyUser, toggleFollow)
userRoutes.get("/searchUsers", verifyUser, searchUser);

module.exports = userRoutes;