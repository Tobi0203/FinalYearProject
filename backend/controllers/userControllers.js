const Posts = require("../models/posts");
const Users = require("../models/users");

const suggestedUsers = async (req, res) => {
    const userId = req.user.id;
    if (!userId) {
        return res.json({ success: false, message: "user not logged in" });
    }
    try {
        const suggUsers = await Users.find({ _id: { $ne: req.user.id } }).select("-password");
        if (!suggUsers) {
            return res.json({ success: false, message: "no user regestred" });
        }
        return res.json({ success: true, users: suggUsers, message: "Users found" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
const currentUser = async (req, res) => {
    try {
        const curUser = await Users.findById(req.user.id).select("_id username email profilePicture");
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
            .select("-password -resetOtpExpireAt -resetToken -resetOtp");

        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        const posts = await Posts.find({ author: profileUserId })
            .sort({ createdAt: -1 });

        const isFollowing = user.followers.includes(loggedInUserId);

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

const toggleFollow = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.json({ success: false, message: "Cannot follow yourself" })
        }
        const currentUser = await Users.findById(currentUserId);
        const targetUser = await Users.findById(targetUserId);
        if (!currentUser || !targetUser) {
            return res.json({ success: false, message: "user not found" })
        }
        const alreadyFollowed = currentUser.following.includes(targetUserId);
        if (alreadyFollowed) {
            currentUser.following.pull(targetUserId);
            await currentUser.save()

            targetUser.followers.pull(currentUserId);
            await targetUser.save();
            return res.json({ success: true, message: "unfollwed successfully", follow: false })
        }
        else {
            currentUser.following.push(targetUserId);
            await currentUser.save();

            targetUser.followers.push(currentUserId);
            await targetUser.save();
            return res.json({ success: true, message: "followed successfully", follow: true });
        }

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
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
        return res.json({success:true,users})
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}
module.exports = { suggestedUsers, currentUser, getUserProfile, toggleFollow, searchUser };