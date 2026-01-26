const mongoose = require("mongoose");
const Postschema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },

    // ===== POST CONTENT =====
    caption: {
        type: String,
        trim: true,
        maxlength: 2200,
    },
    privacy: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    },
    media: [
        {
            url: {
                type: String,
                required: true,
            },
            public_id: {
                type: String,
                required: true,
            },
            resource_type: {
                type: String,
                enum: ["image", "video"],
                default: "image",
            },
        },
    ],

    // ===== ENGAGEMENT =====
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
    ],

    saves: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
    ],

    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users",
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


},
    { timestamps: true }
);

const Posts = mongoose.model("Posts", Postschema);
module.exports = Posts;