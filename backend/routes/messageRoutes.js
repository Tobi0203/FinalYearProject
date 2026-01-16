const express = require("express");
const messageRoutes = express.Router();
const { verifyUser } = require("../middleware/verifyUser");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageControllers");

messageRoutes.post("/", verifyUser, sendMessage);
messageRoutes.get("/:conversationId", verifyUser, getMessages);

module.exports = messageRoutes;
