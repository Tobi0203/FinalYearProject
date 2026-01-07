const Notifications = require("../models/notifications");
const Posts = require("../models/posts");
const Users = require("../models/users");
const { post } = require("../routes/postRoutes");
const onlineUsers = require("../socket/onlineUsers")

const allPosts = async (req, res) => {
    try {
        const posts = await Posts.find()
            .populate("author", "username profilePic")
            .populate("comments.user", "username profilePic")
            .sort({ createdAt: -1 });
        // console.log(posts)
        if (posts.length === 0) {
            return res.json({ success: false, message: "No post found" });
        }
        return res.json({ success: true, message: "found posts", posts: posts });
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
// GET /posts/user/:userId
const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Posts.find({ author: userId })
            .populate("author", "username profilePicture")
            .sort({ createdAt: -1 });
        if (posts.length === 0) {
            return res.json({ success: false, message: "No post found" });
        }

        return res.json({
            success: true,
            posts,
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};


const createPost = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "At least one image or video is required" })
        }
        const io = req.app.get("io");

        const file = req.file;

        const post = await Posts.create({
            author: req.user.id,
            caption: req.body.caption,
            media: [
                {
                    url: file.path,              // secure_url
                    public_id: file.filename,    // Cloudinary public_id
                    resource_type: file.mimetype.startsWith("video")
                        ? "video"
                        : "image",
                },
            ],
        });

        // console.log(post)
        io.emit("postCreation", {
            post,
            userId: req.user.id
        })

        return res.json({ success: true, message: "post created successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
const toggleLike = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    const io = req.app.get("io");

    try {
        const post = await Posts.findById(postId);
        if (!post) {
            return res.json({ success: false, message: "cannot find post" });
        }
        if (post.author.toString() === userId.toString()) {
            return res.json({
                success: false,
                message: "You cannot like your own post",
            });
        }

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes.pull(userId);
            await post.save();

            await Users.findByIdAndUpdate(userId, {
                $pull: { likedPosts: postId },
            });
        } else {
            post.likes.push(userId);
            await post.save();

            await Users.findByIdAndUpdate(userId, {
                $addToSet: { likedPosts: postId },
            });
            const currUser = await Users.findById(userId).select("username");
            const notification = await Notifications.create({
                sender: userId,
                receiver: post.author,
                type: "like",
                message: `${currUser.username} liked your post`
            })
            const targetUser = onlineUsers.get(post.author.toString());
            if (targetUser) {
                io.to(targetUser).emit("likeNotification", notification)
            }
        }

        // 🔥 EMIT AFTER DB UPDATE
        io.emit("postLikeUpdated", {
            postId: post._id,
            likesCount: post.likes.length,
            actionUserId: userId,
        });



        return res.json({
            success: true,
            liked: !alreadyLiked,
            message: alreadyLiked
                ? "post unliked successfully"
                : "post liked successfully",
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
const getLikedPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await Users.findById(userId)
            .populate({
                path: "likedPosts",
                populate: {
                    path: "author",
                    select: "username profilePicture",
                },
            });

        return res.json({
            success: true,
            posts: user.likedPosts,
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
const tooglesaved = async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.postId;
    try {
        const post = await Posts.findById(postId);
        if (!post) {
            return res.json({ success: false, message: "post not found" });
        }
        const alreadySaved = post.saves.includes(userId);
        if (alreadySaved) {
            post.saves.pull(userId);
            await post.save();

            await Users.findByIdAndUpdate(userId, {
                $pull: { savedPosts: postId }
            })
            return res.json({ success: true, saved: false, message: "post unsaved" })
        }
        else {
            post.saves.push(userId);
            await post.save();

            await Users.findByIdAndUpdate(userId, {
                $addToSet: { savedPosts: postId }
            });
            return res.json({ success: true, saved: true, message: "post saved" });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

const getSavedPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await Users.findById(userId)
            .populate({
                path: "savedPosts",
                populate: {
                    path: "author",
                    select: "username profilePicture",
                },
            });

        return res.json({
            success: true,
            posts: user.savedPosts,
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

const addComment = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    const { text } = req.body;
    if (!text || text.trim() === "") {
        return res.json({ success: false, message: "comment is required" });
    }
    try {
        const post = await Posts.findById(postId);
        const userDoc = await Users.findById(userId).select("username profilePicture");
        if (!post) {
            return res.json({ success: false, message: "no comment found" })
        }
        const newComment = {
            user: userId,
            text
        }
        post.comments.push(newComment);
        await post.save();
        const io = req.app.get("io");

        // 🔥 FEED COMMENT UPDATE (ALL USERS)
        io.emit("postCommentAdded", {
            postId,
            comment: {
                user: {
                    _id: userDoc._id,
                    username: userDoc.username,
                    profilePicture: userDoc.profilePicture,
                },
                text,
            },
            actionUserId: userId,
        });
        if (post.author.toString() !== userId.toString()) {
            const notification = await Notifications.create({
                sender: userId,
                receiver: post.author,
                type: "comment",
                message: `${userDoc.username} commented on your post`,
            });

            const targetSocket = onlineUsers.get(post.author.toString());
            if (targetSocket) {
                io.to(targetSocket).emit("commentNotification", notification);
            }
        }
        return res.json({ success: true, message: "comment added successfully", comment: newComment });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
const deleteComment = async (req, res) => {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    try {
        const post = await Posts.findById(postId);
        if (!post) {
            return res.json({ success: false, message: "post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.json({ success: false, message: "comment not found" });
        }

        if (comment.user.toString() !== userId.toString()) {
            return res.json({
                success: false,
                message: "not authorized to delete this comment",
            });
        }

        comment.deleteOne();
        await post.save();

        const io = req.app.get("io");
        io.emit("commentDeleted", {
            postId,
            commentId,
            actionUserId: userId
        })
        return res.json({
            success: true,
            message: "comment deleted successfully",
            commentId,
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

const followingFeed = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "user not found" })
        }
        const usersToFetch = [...user.following, userId];

        const posts = await Posts.find({ author: { $in: usersToFetch } })
            .populate("author", "username profilePicture")
            .populate("comments.user", "username profilePicture")
            .sort({ createdAt: -1 });

        return res.json({ success: true, posts, count: posts.length })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
const deletePost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    const io = req.app.get("io");
    try {
        const post = await Posts.findById(postId);
        if (!post) {
            return res.json({ success: false, message: "post not found" })
        }

        if (post.author.toString() !== userId.toString()) {
            return res.json({ success: false, message: "you are not authorized" })
        }
        await Posts.findByIdAndDelete(postId);

        await Users.findByIdAndUpdate(userId,
            { $pull: { posts: postId } }
        )

        await Users.updateMany({}, {
            $pull: {
                likedPosts: postId,
                savedPosts: postId
            }
        })
        for (const media of post.media) {
            await cloudinary.uploader.destroy(media.public_id, {
                resource_type: media.resource_type || "image",
            });
        }
        io.emit("postDelete", {
            postId,
            actionUserId: userId,
        })
        return res.json({ success: true, message: "post deleted successfully" })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
const editPost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    const { newCaption } = req.body;
    if (!newCaption) {
        return res.json({ success: false, message: "caption is required" })
    }
    try {
        const post = await Posts.findById(postId);
        if (!post) {
            return res.json({ success: false, message: "post not found" })
        }
        if (post.author.toString() !== userId.toString()) {
            return res.json({ success: false, message: "not authorized to edit" })
        }
        post.caption = newCaption || post.caption;
        await post.save();

        return res.json({ success: true, message: "Caption editeed successfully", post });

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

module.exports = { allPosts, getUserPosts, createPost, toggleLike, getLikedPosts, tooglesaved, getSavedPosts, addComment, deleteComment, followingFeed, deletePost, editPost };