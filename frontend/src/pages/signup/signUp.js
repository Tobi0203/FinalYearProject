import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "./signUp.css";
import axiosIns from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export const SignUp = () => {
  const navigate=useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: ""
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
      const res = await axiosIns.post("/auth/register", formData);

      if (res.data.success) {
        // alert(res.data.message);
        toast.success(res.data.message);
        console.log(res.data);
        navigate("/auth/login")
      } else {
        toast.error(res.data.message || "Registration failed");
      }

    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="signupMain">
      <div className="sigupCont">

        <div className="signupLeft">
          <h2>Welcome Back!</h2>
          <p>Create an account to continue</p>
        </div>

        <div className="signupRight">
          <form className="signupForm" onSubmit={handleSubmit}>

            <h2>Create Account</h2>

            <div className="inputGroup">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="inputGroup">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter Username"
                required
              />
            </div>

            <div className="inputGroup">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="inputGroup">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" className="signupBtn">
              Register
            </button>

            <p className="loginLink">
              Already have an account? <span><Link to="/auth/login" className="loginLinkText">Login</Link></span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};
