const express = require("express");
const messageRoutes = express.Router();
const { verifyUser } = require("../middleware/verifyUser");
const {
  sendMessage,
  getMessages,
  getChatBlockStatus,
  sendPostMessage,
  deleteMessage,
  deleteMultipleMessages
} = require("../controllers/messageControllers");

messageRoutes.post("/", verifyUser, sendMessage);
messageRoutes.post("/post", verifyUser, sendPostMessage); // 
messageRoutes.get("/:conversationId", verifyUser, getMessages);
messageRoutes.get("/block-status/:conversationId", verifyUser, getChatBlockStatus);
messageRoutes.delete("/:messageId", verifyUser, deleteMessage);
messageRoutes.put("/delete-multiple", verifyUser, deleteMultipleMessages);


module.exports = messageRoutes;
