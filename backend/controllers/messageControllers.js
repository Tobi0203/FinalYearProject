const Message = require("../models/message");
const Conversation = require("../models/conversation");
const Posts = require("../models/posts");
const Users = require("../models/users");
const onlineUsers = require("../socket/onlineUsers")
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
      isDeleted: false,
    })
      .populate("sender", "username profilePicture")
      .populate({
        path: "post",
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      })
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getChatBlockStatus = async (req, res) => {
  const userId = req.user.id;
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId)
    .populate("members", "blockedUsers");

  if (!conversation) {
    return res.json({ status: null });
  }

  const otherUser = conversation.members.find(
    m => m._id.toString() !== userId
  );

  if (!otherUser) {
    return res.json({ status: null });
  }

  // 🔒 I BLOCKED THEM
  const me = await Users.findById(userId).select("blockedUsers");
  if (me.blockedUsers.includes(otherUser._id)) {
    return res.json({ status: "BLOCKED_BY_ME" });
  }

  // 🚫 THEY BLOCKED ME
  if (otherUser.blockedUsers.includes(userId)) {
    return res.json({ status: "I_AM_BLOCKED" });
  }

  res.json({ status: null });
};
const sendPostMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, postId } = req.body;

    if (!conversationId || !postId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const post = await Posts.findById(postId).populate(
      "author",
      "username profilePic"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 🔐 Privacy check (important)
    if (post.visibility === "private") {
      return res
        .status(403)
        .json({ message: "Cannot share private post" });
    }

    const message = await Message.create({
      conversationId,
      sender: senderId,
      post: postId,
      type: "post"
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username profilePicture")
      .populate({
        path: "post",
        populate: {
          path: "author",
          select: "username profilePicture"
        }
      });

    // ⚡ Socket.IO real-time
    const io = req.app.get("io");
    const receiverId = conversation.members.find(
      id => id.toString() !== senderId
    );

    const receiverSocketId = onlineUsers.get(receiverId?.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", populatedMessage);
    }


    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send post message" });
  }
};
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    message.isDeleted = true;
    await message.save();

    // 🔥 Real-time update
    const io = req.app.get("io");
    io.emit("messageDeleted", { messageId });

    res.json({ success: true, messageId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMultipleMessages = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    // 1️⃣ FIRST fetch messages (declare messages FIRST)
    const messages = await Message.find({
      _id: { $in: messageIds },
      sender: userId,
    });

    // 2️⃣ Permission check
    if (!messages.length) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 3️⃣ Soft delete
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $set: { isDeleted: true } }
    );

    // 4️⃣ Emit socket event to BOTH users
    const io = req.app.get("io");

    for (const msg of messages) {
      const conversation = await Conversation.findById(msg.conversationId);

      if (!conversation) continue;

      conversation.members.forEach((memberId) => {
        io.to(memberId.toString()).emit("multipleMessagesDeleted", {
          messageIds,
        });
      });
    }

    // 5️⃣ Done
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE MULTIPLE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};



module.exports = { getMessages, sendMessage, getChatBlockStatus, sendPostMessage, deleteMultipleMessages, deleteMessage };