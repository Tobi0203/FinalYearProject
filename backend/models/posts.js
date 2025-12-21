const mongoose = require("mongoose");
const Postschema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // ===== POST CONTENT =====
    caption: {
        type: String,
        trim: true,
        maxlength: 2200,
    },

    media: [
        {
            type: String, // image/video URL
            required: true,
        },
    ],

    // ===== ENGAGEMENT =====
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    saves: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            text: {
                type: String,
                required: true,
                trim: true,
                maxlength: 500,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],

    // ===== VISIBILITY =====
    isPublic: {
        type: Boolean,
        default: true,
    },
},
    { timestamps: true }
);

const Posts = mongoose.model("Posts", Postschema);
module.exports = Posts;