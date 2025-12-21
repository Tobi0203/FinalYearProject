import React, { useState } from 'react'
import axiosIns from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import "./forgetPassword.css";

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosIns.post("/auth/sendResetOtp", {email});
            if (res.data.success) {
                toast.success(res.data.message);
                localStorage.setItem("resetToken",res.data.resetToken)
                navigate("/auth/passwordReset", { state: email })
            }
            else {
                toast.error(res.data.message);
            }

        } catch (error) {
            toast.error("Server error")
        }
    }
    return (
        <div className="forgotMain">
            <form onSubmit={handleSubmit} className="forgotForm">
                <h2>Forgot Password</h2>

                <div className='forgotEmail'>
                    <label>Enter email</label><br/>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <button type="submit" className='forgetBtn'>Send OTP</button>
            </form>
        </div>
    )
}
export default ForgetPassword
