const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profilePictures",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
  },
});

const profileUpload = multer({ storage });

module.exports = profileUpload;
