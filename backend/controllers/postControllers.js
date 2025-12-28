const Posts = require("../models/posts");
const Users = require("../models/users");
const { post } = require("../routes/postRoutes");

const allPosts = async (req, res) => {
    try {
        const posts = await Posts.find()
            .populate("author", "username profilePic")
            .sort({ createdAt: -1 });
        console.log(posts)
        if (posts.length === 0) {
            return res.json({ success: false, message: "No post found" });
        }
        return res.json({ success: true, message: "found posts", posts: posts });
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

const createPost = async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ success: false, message: "At least one image or video is required" })
        }

        // const mediaUrls = req.files.map((file) => file.path);
        console.log(req.user.id)
        const post = await Posts.create({
            author: req.user.id,
            caption: req.body.caption,
            media: [req.file.path],
        })
        console.log(post)

        return res.json({ success: true, message: "post created successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
const toggleLike = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    console.log(req.params)
    console.log(req.user)

    try {
        const post = await Posts.findById(postId);

        if (!post) {
            return res.json({ success: false, message: "cannot find post" });
        }
        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes.pull(userId);
            await post.save();

            await Users.findByIdAndUpdate(userId, {
                $pull: { likedPosts: postId }
            })
            return res.json({ success: true, message: "post unliked successfully" })
        }

        else {
            post.likes.push(userId);
            await post.save();

            await Users.findByIdAndUpdate(userId, {
                $addToSet: { likedPosts: postId }
            });
        }
        return res.json({ success: true, message: "post liked successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
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
            return res.json({ success: true, message: "post unsaved" })
        }
        else {
            post.saves.push(userId);
            await post.save();

            await Users.findByIdAndUpdate(userId, {
                $addToSet: { savedPosts: postId }
            });
            return res.json({ success: true, message: "post saved" });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
const addComment = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    const { text } = req.body;
    if (!text || text.trim() === "") {
        return res.json({ success: false, message: "comment is required" });
    }
    try {
        const post = await Posts.findById(postId);
        if (!post) {
            return res.json({ success: false, message: "no comment found" })
        }
        const newComment = {
            user: userId,
            text
        }
        post.comments.push(newComment);
        await post.save();

        return res.json({ success: true, message: "comment added successfully", comment: newComment });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
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
module.exports = { allPosts, createPost, toggleLike, tooglesaved, addComment, followingFeed, deletePost, editPost };