const nodemailer = require("nodemailer");
const dotenv=require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your App Password (not your real Gmail password!)
    },
});
module.exports=transporter;