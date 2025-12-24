const user = require("../models/users");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../utils/transporter");

const register = async (req, res) => {
    const { name, username, email, password } = req.body;
    if (!name || !email || !password || !username) {
        return res.json({ success: false, message: "require all feilds" });
    }
    const emailExist = await user.findOne({ email });
    if (emailExist) {
        return res.json({ success: false, message: "email already exist" });
    }
    try {
        const hashPass = await bcryptjs.hash(password, 10);
        const newUser = new user({ name, username, email, password: hashPass });
        const userDet = await newUser.save();

        // const token=jwt.sign({id:newUser._id},process.env.JWT_SECRET,{expiresIn:"1d"});
        // res.cookie('token',token,{
        //     httpOnly:true,
        //     secure:process.env.NODE_ENV==='production',
        //     sameSite:process.env.NODE_ENV=='production'?'none':'strict',
        //     maxAge:7*24*60*60*1000
        // })

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "welcom to our website",
            text: `welcom to our website.your account has created with email address ${email}`
        }
        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "user created successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const exist = await user.findOne({ email });
        if (!exist) {
            return res.json({ success: false, message: "user does not exist" });
        }
        const match = await bcryptjs.compare(password, exist.password);
        // console.log("Compare result:", match);
        if (!match) {
            return res.json({ success: false, message: "password not match" });
        }
        const token = jwt.sign({ id: exist._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.json({ success: true, message: "login successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'strict',
        })
        return res.json({ success: true, message: "logout successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
// const sendVerifyOtp = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const existUser = await user.findById(userId);
//         if (existUser.isVerified) {
//             return res.json({ success: false, message: "user already verified" });
//         }
//         const otp = String(Math.floor(100000 + Math.random() * 900000));
//         existUser.verifyOtp = otp;
//         existUser.verifyOtpExpireAt = Date.now() + 2 * 60 * 1000;
//         await existUser.save();
//         // console.log(otp);

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: existUser.email,
//             subject: "email verification",
//             text: `your verification otp is : ${otp}.otp expires in 10 min.`
//         }
//         await transporter.sendMail(mailOptions);

//         return res.json({ success: true, message: "otp send successfully" });
//     } catch (error) {
//         return res.json({ success: false, message: error.message });
//     }

// }
// const verifyEmail = async (req, res) => {
//     const userId = req.user.id;
//     const { otp } = req.body;
//     if (!userId || !otp) {
//         return res.json({ success: false, message: "messing details" })
//     }
//     try {
//         const existUser = await user.findById(userId);
//         if (!existUser) {
//             return res.json({ success: false, message: "user not found" })
//         }
//         if (existUser.verifyOtp === '' || existUser.verifyOtp != otp) {
//             return res.json({ success: false, message: "invalid otp" })
//         }
//         if (existUser.verifyOtpExpireAt < Date.now()) {
//             return res.json({ success: false, message: "otp expired" })
//         }

//         existUser.isVerified = true;
//         existUser.verifyOtp = '';
//         existUser.verifyOtpExpireAt = 0;
//         await existUser.save();
//         return res.json({ success: true, message: "email veried successfully" });

//     } catch (error) {
//         return res.json({ success: false, message: error.message });
//     }
// }
const sendResetOtp = async (req, res) => {
    try {
        let User;
        let resetToken;
        // 🔁 First time → email
        if (req.body.email) {
            User = await user.findOne({ email: req.body.email });
            if (!User) {
                return res.json({ success: false, message: "user not found" });
            }
            resetToken = jwt.sign(
                { userId: User._id },
                process.env.JWT_SECRET,
                { expiresIn: "10m" }
            );
        }

        // 🔁 Resend → token
        else if (req.body.resetToken) {
            const decoded = jwt.verify(req.body.resetToken, process.env.JWT_SECRET);
            User = await user.findById(decoded.userId);
            if (!User) {
                return res.json({ success: false, message: "user not found" });
            }
        }

        else {
            return res.json({ success: false, message: "email or token required" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        User.resetOtp = otp;
        User.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
        User.resetToken = resetToken;
        await User.save();

        await transporter.sendMail({
            to: User.email,
            subject: "Password Reset OTP",
            text: `Your OTP is ${otp}. It expires in 10 minutes`
        });

        return res.json({
            success: true,
            message: "OTP sent successfully",
            resetToken
        });

    } catch (error) {
        return res.json({ success: false, message: "invalid or expired token" });
    }
};

const passwordReset = async (req, res) => {
    const { resetToken, otp, newPassword } = req.body;
    if (!resetToken || !otp || !newPassword) {
        return res.json({ success: false, message: "messing details" });
    }
    try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const existUser = await user.findById(decoded.userId);
        if (!existUser) {
            return res.json({ success: false, message: "user not found" })
        }
        if (existUser.resetOtp === '' || existUser.resetOtp != otp) {
            return res.json({ success: false, message: "invalid otp" })
        }
        if (existUser.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "otp expired" })
        }
        const hashpass = await bcryptjs.hash(newPassword, 10);
        existUser.password = hashpass;
        existUser.resetOtp = '';
        existUser.resetOtpExpireAt = 0;
        existUser.resetToken = "";
        await existUser.save();
        return res.json({ success: true, message: "password reset successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
module.exports = { register, login, logout, sendResetOtp, passwordReset };
// sendVerifyOtp, verifyEmail