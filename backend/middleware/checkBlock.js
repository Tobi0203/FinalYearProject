const Users = require("../models/users");
const Posts = require("../models/posts");

const checkBlock = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    let targetUserId = null;

    // 1️⃣ PROFILE / FOLLOW ROUTES
    if (req.params?.userId) {
      targetUserId = req.params.userId;
    }

    // 2️⃣ MESSAGE ROUTES (POST only)
    if (req.body && req.body.receiverId) {
      targetUserId = req.body.receiverId;
    }

    // 3️⃣ POST INTERACTION ROUTES
    if (req.params?.postId) {
      const post = await Posts.findById(req.params.postId).select("author");
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }
      targetUserId = post.author.toString();
    }

    // No target → skip check
    if (!targetUserId) return next();

    const targetUser = await Users.findById(targetUserId).select("blockedUsers");
    if (!targetUser) return next();

    // ❌ BLOCK CHECK
    if (targetUser.blockedUsers.includes(currentUserId)) {
      return res.status(403).json({
        success: false,
        message: "You are blocked by this user",
      });
    }

    next();
  } catch (error) {
    console.error("checkBlock error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Block check failed" });
  }
};

module.exports = { checkBlock };
