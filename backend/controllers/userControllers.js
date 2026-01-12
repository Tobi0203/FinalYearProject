const Posts = require("../models/posts");
const Users = require("../models/users");
const Notifications = require("../models/notifications");
const cloudinary = require("../utils/cloudinary")
const onlineUsers = require("../socket/onlineUsers")

const suggestedUsers = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.json({ success: false, message: "user not logged in" });
  }
  try {
    const suggUsers = await Users.find({ _id: { $ne: req.user.id } }).select("username name profilePicture followers ");
    const userswithfollowstatus = suggUsers.map((u) => ({
      _id: u._id,
      username: u.username,
      name: u.name,
      profilePicture: u.profilePicture,
      isFollowing: u.followers.includes(req.user.id),
    }));
    if (!suggUsers) {
      return res.json({ success: false, message: "no user regestred" });
    }
    return res.json({ success: true, users: userswithfollowstatus, message: "Users found" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}
const currentUser = async (req, res) => {
  try {
    const curUser = await Users.findById(req.user.id).select("_id username email profilePicture followers following sentRequests followRequests isPrivate").populate("followRequests", "username profilePicture");

    if (!curUser) {
      return res.json({ success: false, message: "user not found" });
    }
    return res.json({ success: true, message: "current user found", user: curUser })
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

const getUserProfile = async (req, res) => {
  try {
    const profileUserId = req.params.userId;
    const loggedInUserId = req.user.id;

    const user = await Users.findById(profileUserId)
      .select("_id username email profilePicture followers following sentRequests followRequests isPrivate");


    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const isFollowing = user.followers.includes(loggedInUserId);
    const isOwnProfile = profileUserId === loggedInUserId;

    // 🔒 PRIVATE ACCOUNT & NOT FOLLOWING
    let posts = [];

    if (!user.isPrivate || isFollowing || isOwnProfile) {
      posts = await Posts.find({ author: profileUserId })
        .sort({ createdAt: -1 });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount: posts.length,
        isFollowing,
        isPrivate: user.isPrivate,
        followRequests: user.followRequests,
        sentRequests: user.sentRequests,
      },
      posts,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params; // ✅ IMPORTANT

    const user = await Users.findById(userId)
      .populate("following", "username name profilePicture");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      users: user.following || [],
    });
  } catch (error) {
    console.error("getFollowing:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params; // ✅ IMPORTANT

    const user = await Users.findById(userId)
      .populate("followers", "username name profilePicture");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      users: user.followers || [],
    });
  } catch (error) {
    console.error("getFollowers:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;
    const io = req.app.get("io");

    if (targetUserId === currentUserId) {
      return res.json({
        success: false,
        message: "Cannot follow yourself",
      });
    }

    const currentUser = await Users.findById(currentUserId);
    const targetUser = await Users.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const isFollowing = currentUser.following.includes(targetUserId);
    const alreadyRequested = currentUser.sentRequests.includes(targetUserId);

    // 🔴 UNFOLLOW
    if (isFollowing) {
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);

      await currentUser.save();
      await targetUser.save();
      console.log("backend unfollow");
      io.emit("followUpdate", {
        targetUserId,
        actionUserId: currentUserId,
        isFollowing: false, // 🔥 IMPORTANT
      });

      return res.json({
        success: true,
        follow: false,
        status: "unfollowed",
        message: "Unfollowed successfully",
      });
    }

    // 🟡 REQUEST ALREADY SENT
    if (alreadyRequested) {
      return res.json({
        success: true,
        status: "requested",
        message: "Follow request already sent",
      });
    }

    // 🔒 PRIVATE ACCOUNT → SEND REQUEST
    if (targetUser.isPrivate) {
      targetUser.followRequests.push(currentUserId);
      currentUser.sentRequests.push(targetUserId);

      await targetUser.save();
      await currentUser.save();

      const notification = await Notifications.create({
        sender: currentUserId,
        receiver: targetUserId,
        type: "follow",
        message: `${currentUser.username} sent you a follow request`,
      });

      const targetSocket = onlineUsers.get(targetUserId.toString());
      if (targetSocket) {
        io.to(targetSocket).emit("newNotification", notification);
      }
      io.to(targetSocket).emit("followRequest", {
        _id: currentUser._id,
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
      });



      return res.json({
        success: true,
        status: "requested",
        message: "Follow request sent",
      });
    }

    // 🟢 PUBLIC ACCOUNT → FOLLOW DIRECTLY
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    const notification = await Notifications.create({
      sender: currentUserId,
      receiver: targetUserId,
      type: "follow",
      message: `${currentUser.username} started following you`,
    });

    io.emit("followUpdate", {
      targetUserId,
      actionUserId: currentUserId,
      isFollowing: true,
    });

    const targetSocket = onlineUsers.get(targetUserId.toString());
    if (targetSocket) {
      io.to(targetSocket).emit("newNotification", notification);
    }

    return res.json({
      success: true,
      follow: true,
      status: "followed",
      message: "Followed successfully",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
const acceptFollowRequest = async (req, res) => {
  try {
    const requesterId = req.params.userId; // person who sent request
    const currentUserId = req.user.id;     // private account owner
    const io = req.app.get("io");

    const currentUser = await Users.findById(currentUserId);
    const requester = await Users.findById(requesterId);

    if (!currentUser || !requester) {
      return res.json({ success: false, message: "User not found" });
    }

    // ❌ No request exists
    if (!currentUser.followRequests.includes(requesterId)) {
      return res.json({
        success: false,
        message: "No follow request found",
      });
    }

    // Remove request
    currentUser.followRequests.pull(requesterId);
    requester.sentRequests.pull(currentUserId);

    // Add follower / following
    currentUser.followers.push(requesterId);
    requester.following.push(currentUserId);

    await currentUser.save();
    await requester.save();
    const requesterSocket = onlineUsers.get(requesterId.toString());

    if (requesterSocket) {
      io.to(requesterSocket).emit("followRequestAccepted", {
        targetUserId: currentUserId, // private profile ID
      });
    }
    io.emit("followUpdate", {
      targetUserId: currentUserId, // private profile owner
      actionUserId: requesterId,
      isFollowing: true,
    });


    // 🔔 Notification
    const notification = await Notifications.create({
      sender: currentUserId,
      receiver: requesterId,
      type: "follow",
      message: `${currentUser.username} accepted your follow request`,
    });

    // const requesterSocket = onlineUsers.get(requesterId.toString());
    if (requesterSocket) {
      io.to(requesterSocket).emit("newNotification", notification);
    }


    return res.json({
      success: true,
      message: "Follow request accepted",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
const declineFollowRequest = async (req, res) => {
  try {
    const requesterId = req.params.userId;
    const currentUserId = req.user.id;
    const io = req.app.get("io");

    const currentUser = await Users.findById(currentUserId);
    const requester = await Users.findById(requesterId);

    if (!currentUser || !requester) {
      return res.json({ success: false, message: "User not found" });
    }

    // ❌ No request exists
    if (!currentUser.followRequests.includes(requesterId)) {
      return res.json({
        success: false,
        message: "No follow request found",
      });
    }

    // Remove request only
    currentUser.followRequests.pull(requesterId);
    requester.sentRequests.pull(currentUserId);

    await currentUser.save();
    await requester.save();
    const requesterSocket = onlineUsers.get(requesterId.toString());
    if (requesterSocket) {
      io.to(requesterSocket).emit("followRequestDeclined", {
        targetUserId: currentUserId, // private profile
      });
    }

    return res.json({
      success: true,
      message: "Follow request declined",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};


// controllers/userController.js
const removeFollower = async (req, res) => {
  try {
    const userId = req.user.id;           // profile owner
    const followerId = req.params.followerId;

    if (userId === followerId) {
      return res.json({ success: false, message: "Invalid action" });
    }

    // remove followerId from my followers
    await Users.findByIdAndUpdate(userId, {
      $pull: { followers: followerId },
    });

    // remove me from follower's following
    await Users.findByIdAndUpdate(followerId, {
      $pull: { following: userId },
    });

    return res.json({
      success: true,
      message: "Follower removed",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const searchUser = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.json({ success: false, message: "search query is required" })
    }

    const users = await Users.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
      _id: { $ne: req.user.id },
    }).select("username name profilePicture");
    return res.json({ success: true, users })
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

// controllers/userController.js
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, username, bio } = req.body;

    // 🔥 STEP 1: Fetch existing user FIRST
    const existingUser = await Users.findById(userId);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updateData = { name, username, bio };

    // 🔥 STEP 2: If new image uploaded → delete old image
    if (req.file) {
      if (existingUser.profilePictureId) {
        await cloudinary.uploader.destroy(
          existingUser.profilePictureId
        );
      }

      updateData.profilePicture = req.file.path;
      updateData.profilePictureId = req.file.filename;
    }

    // 🔥 STEP 3: Update user
    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    console.log("✅ UPDATED USER:", updatedUser);

    return res.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {
    console.error("❌ UPDATE PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);

    if (user.profilePictureId) {
      await cloudinary.uploader.destroy(user.profilePictureId);
    }

    user.profilePicture = "";
    user.profilePictureId = "";
    await user.save();

    return res.json({
      success: true,
      message: "Profile picture removed",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = { suggestedUsers, currentUser, getUserProfile, toggleFollow, declineFollowRequest, removeFollower, searchUser, getFollowers, getFollowing, updateProfile, removeProfilePicture, acceptFollowRequest };