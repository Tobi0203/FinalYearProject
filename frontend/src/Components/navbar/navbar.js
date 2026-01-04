import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useNotifications } from "../../context/notificationContext";
import { useOnlineStatus } from "../../context/onlineStatusContext";
import { IoIosNotifications } from "react-icons/io";
// import { FaUser } from "react-icons/fa6";
import axiosIns from "../../utils/axiosInstance";
import "./navbar.css";

const Navbar = () => {
    const { user, logout } = useAuth();
    const { notifications, clearNotifications, markNotificationsAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null)
    const {onlineUsers}=useOnlineStatus()

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();


    const toggleNotifications = () => {
        setShowNotifications((prev) => {
            if (!prev && notifications?.some((n) => !n.isRead)) {
                markNotificationsAsRead();
            }
            return !prev;
        });
    };
    // Navigate to profile
    const handleNavigate = (userId) => {
        navigate(`/profile/${userId}`);
    };

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const delay = setTimeout(async () => {
            try {
                const res = await axiosIns.get(
                    `/users/searchUsers?q=${searchQuery}`
                );
                if (res.data.success) {
                    setSearchResults(res.data.users);
                    setShowSearch(true);
                }
            } catch (error) {
                console.error("Search error", error);
            }
        }, 400);

        return () => clearTimeout(delay);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const unreadCount = notifications?.filter(
        (n) => !n.isRead
    ).length;

    return (
        <nav className="navbar">
            {/* LEFT */}
            <div className="navbar-left">
                <Link to="/home" className="logo">
                    SocialHub
                </Link>
            </div>

            {/* CENTER */}
            <div className="navbar-center" ref={searchRef}>
                <input
                    type="text"
                    className="navbar-search"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults.length && setShowSearch(true)}
                />

                {showSearch && (
                    <div className="search-dropdown">
                        {searchResults.length > 0 ? (
                            searchResults.map((user) => (
                                <div key={user._id} className="search-item">
                                    <img
                                        src={user.profilePicture || "/assets/images/avatar.webp"}
                                        alt="User"
                                    />
                                    <span>{user.username}</span>
                                </div>
                            ))
                        ) : (
                            <p className="no-search">No users found</p>
                        )}
                    </div>
                )}
            </div>


            {/* RIGHT */}
            <div className="navbar-right">
                {/* 🔔 NOTIFICATIONS */}
                <div className="notification-wrapper" ref={notificationRef}>
                    <span
                        className="notification-bell"
                        onClick={toggleNotifications}
                    >
                        <IoIosNotifications />
                        {unreadCount > 0 && (
                            <span className="notification-count">
                                {unreadCount}
                            </span>
                        )}

                    </span>

                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <span>Notifications</span>
                                {notifications?.length > 0 && (
                                    <button onClick={clearNotifications}>
                                        Clear
                                    </button>
                                )}
                            </div>

                            <div className="notification-list">
                                {notifications?.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            className="notification-item"
                                        >
                                            {n.message}
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-notification">
                                        No notifications
                                    </p>
                                )}
                            </div>

                        </div>
                    )}
                </div>

                {/* 👤 PROFILE */}
                <div className="navbar-profile">
                    <div className="profile-wrapper" onClick={() => handleNavigate(user._id)}>
                        <img
                            src={user.profilePicture || "/assets/images/avatar.webp"}
                            alt="User"
                            className="profile-img"
                        />
                        <span
                            className={`status-dot ${onlineUsers[user._id] ? "online" : "offline"
                                }`}
                        />
                        <span className="profile-tooltip">
                            {user.username}
                        </span>
                    </div>
                    <button className="logout-btn" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
