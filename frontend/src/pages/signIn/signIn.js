import React, { useState } from 'react'
import "./signIn.css";
import axiosIns from '../../utils/axiosInstance';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export const SignIn = () => {
    // const navigate=useNavigate();
    const [formData, setFormData] = useState({
        "email": "",
        "password": ""
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosIns.post("/auth/login", formData);
            if (res.data.success) {
                // alert(res.data.message);
                // navigate("/auth/login")
                toast.success(res.data.message);
                console.log(res.data);
            } else {
                toast.error(res.data.message || "Registration failed");
            }

        } catch (error) {
            console.error("Register error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Server error");
        }
    }

    return (
        <div className='signinMain'>
            <div className='signinCont'>
                <div className='signinLeft'>
                    <h2>Welcome Back</h2>
                    <p>Login to continue</p>
                </div>
                <div className='signinRight'>
                    <form className='signinForm' onSubmit={handleSubmit}>
                        <h2>Login In</h2>
                        <div className='inputGroup'>
                            <label>Email</label>
                            <input
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                placeholder='Enter email'
                                required
                            />
                        </div>
                        <div className='inputGroup'>
                            <label>Password</label>
                            <input
                                type='password'
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                placeholder='Enter password'
                                required
                            />
                        </div>
                        <Link to="/auth/sendResetOtp" className='passwordresetLink'>Forget password</Link>
                        <button type="submit" className="signinBtn">
                            Login
                        </button>

                        <p className="signupLink">
                            Don't have an account? <span><Link to="/auth/register" className="signupLinkText">register</Link></span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
