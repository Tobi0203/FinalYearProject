import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  return (
    <div className="landing">
      {/* Navbar */}
      <header className="landing-header">
        <h1 className="logo">SocialHub</h1>
        <nav className="nav">
          <Link to="/auth/login" className="nav-link">Login</Link>
          <Link to="/auth/register" className="btn-primary">Sign Up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h2>Connect. Share. Express.</h2>
          <p>
            A modern social media platform where you can share moments, connect
            with friends, and discover new content.
          </p>
          <div className="hero-actions">
            <Link to="/auth/register" className="btn-primary">Create Account</Link>
            <Link to="/auth/login" className="btn-outline">Login</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-card">
          <h3>Create Posts</h3>
          <p>Share photos, thoughts, and updates with your followers.</p>
        </div>
        <div className="feature-card">
          <h3>Like & Comment</h3>
          <p>Engage with posts through likes and comments.</p>
        </div>
        <div className="feature-card">
          <h3>Secure Accounts</h3>
          <p>JWT authentication with Google login and OTP recovery.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} SocialHub. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
