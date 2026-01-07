const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ""
    },
    profilePictureId: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        },
    ],
    followRequests: [{           // incoming requests
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],

    sentRequests: [{             // outgoing requests
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],

    isPrivate: {
        type: Boolean,
        default: false
    },

    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Posts",
        },
    ],

    likedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Posts",
        },
    ],

    savedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Posts",
        },
    ],
    // verifyOtp: {
    //     type: String,
    //     default: ''
    // },
    // verifyOtpExpireAt: {
    //     type: Number,
    //     default: 0
    // },
    // isVerified: {
    //     type: Boolean,
    //     default: false
    // },
    resetOtp: {
        type: String,
        default: ''
    },
    resetOtpExpireAt: {
        type: Number,
        default: 0
    },
    resetToken: {
        type: String,
        default: ''
    }

}, { timestamps: true })

const Users = mongoose.model("Users", userSchema);
module.exports = Users;