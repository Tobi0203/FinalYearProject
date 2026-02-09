import React, { useEffect, useState } from 'react'
import {  useNavigate } from "react-router-dom";
import axiosIns from '../../Utils/AxiosInstance';
import { toast } from 'react-toastify';
import "./PasswordReset.css"

export const PasswordReset = () => {
    const navigate = useNavigate();

    const resetToken=localStorage.getItem("resetToken");

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [conformPassword, setConformPassword] = useState("");

    const [timer, setTimer] = useState(600);
    const [showResend, setShowResend] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== conformPassword) {
            toast.error("Password Mismatch")
            return
        }
        try {
            const res = await axiosIns.post("/auth/passwordReset",{ resetToken, otp, newPassword })

            if (res.data.success) {
                toast.success(res.data.message);
                localStorage.removeItem("resetToken");
                navigate("/auth/login");
            }
            else {
                if (res.data.message === "otp expired") {
                    toast.error(res.data.message);
                    setShowResend(true);
                }
                else {
                    toast.error(res.data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleResendOtp = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosIns.post("/auth/sendResetOtp", {resetToken})
            if (res.data.success) {
                toast.success("New OTP sent");
                setTimer(300);
                setShowResend(false);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            toast.error("Failed to resend OTP");
        }
    }

        useEffect(() => {
            if (timer <= 0) {
                setShowResend(true);
                return;
            }

            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(interval);
        }, [timer])

        return (
            <div className='PasswordResetMain'>
                <form className="PasswordResetForm" onSubmit={handleSubmit}>
                    <h2>Reset Password</h2>
                    <div className='otp'>
                        <label>Enter OTP</label>
                        <input
                            type='text'
                            placeholder='123456'
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    <div className='newPassword'>
                        <label>Enter NewPassword</label>
                        <input
                            type='password'
                            placeholder='NewPassword'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className='conformPassword'>
                        <label>Conform Password</label>
                        <input
                            type='password'
                            placeholder='conformPassword'
                            value={conformPassword}
                            onChange={(e) => setConformPassword(e.target.value)}
                            required
                        />
                    </div>
                    {!showResend ? (
                        <p className="timer">
                            OTP expires in{" "}
                            <strong>
                                {Math.floor(timer / 60)}:
                                {String(timer % 60).padStart(2, "0")}
                            </strong>
                        </p>
                    ) : (
                        <button
                            type="button"
                            className="resendBtn"
                            onClick={handleResendOtp}
                        >
                            Resend OTP
                        </button>
                    )}

                    <button type="submit" className="passwordResetBtn">
                        Reset Password
                    </button>
                </form>
            </div>
        )
    }
