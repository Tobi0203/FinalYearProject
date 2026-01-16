const express = require("express");
const conversationRouter = express.Router();
const {verifyUser} = require("../middleware/verifyUser");
const { createConversation, getUserConversations } = require("../controllers/conversationController");

conversationRouter.post("/", verifyUser, createConversation);
conversationRouter.get("/", verifyUser, getUserConversations);

module.exports = conversationRouter;
