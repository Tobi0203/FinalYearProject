const Message = require("../models/message");
const Conversation = require("../models/conversation");

// 1️⃣ Send message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      text,
    });

    // update last message in inbox
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text,
      updatedAt: Date.now(),
    });
    

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2️⃣ Fetch messages
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("sender", "username profilePic")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports={getMessages,sendMessage};