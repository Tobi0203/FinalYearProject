const Posts = require("../models/posts");
const post = require("../models/posts");

const allPosts = async (req, res) => {
    try {
        const posts = await post.find({ isPublic: true })
            .populate("author", "username profilePic")
            .sort({ createdAt: -1 });
        if (!posts) {
            return res.json({ success: false, message: "No post found" });
        }
        return res.json({ success: true, message: "found posts", posts: posts });
    } catch (error) {
        return rs.json({ success: false, message: error.message })
    }
}

const createPost = async (req, res) => {
    try {
        if (!req.file || req.file.length == 0) {
            return res.json({ success: false, message: "At least one image or video is required" })
        }

        // const mediaUrls = req.files.map((file) => file.path);

        const post = await Posts.create({
            author: req.user,
            caption: req.body.caption,
            media: [req.file.path],
        })
        console.log(post)

        return res.json({success:true,message:"post created successfully"});
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}
module.exports = { allPosts, createPost };