import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosNotifications } from "react-icons/io";

import { useAuth } from "../../Context/AuthContext";
import { useNotifications } from "../../Context/NotificationContext";
import { useOnlineStatus } from "../../Context/OnlineStatusContext";
import SearchBar from "../SearchBar/SearchBar";

// import axiosIns from "../../Utils/AxiosInstance";
import "./Navbar.css";

const Navbar = () => {
    const { user, logout } = useAuth();
    const {
        notifications,
        clearNotifications,
        markNotificationsAsRead,
    } = useNotifications();
    const { onlineUsers } = useOnlineStatus();

    const navigate = useNavigate();

    /* ================= Notifications ================= */
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const toggleNotifications = () => {
        setShowNotifications((prev) => {
            if (!prev && unreadCount > 0) {
                markNotificationsAsRead();
            }
            return !prev;
        });
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // /* ================= Search ================= */
    // const [searchQuery, setSearchQuery] = useState("");
    // const [searchResults, setSearchResults] = useState([]);
    // const [showSearch, setShowSearch] = useState(false);
    // const searchRef = useRef(null);

    // useEffect(() => {
    //     if (!searchQuery.trim()) {
    //         setSearchResults([]);
    //         setShowSearch(false);
    //         return;
    //     }

    //     const delay = setTimeout(async () => {
    //         try {
    //             const res = await axiosIns.get(
    //                 `/users/searchUsers?q=${searchQuery}`
    //             );
    //             if (res.data.success) {
    //                 setSearchResults(res.data.users);
    //                 setShowSearch(true);
    //             }
    //         } catch (error) {
    //             console.error("Search error", error);
    //         }
    //     }, 400);

    //     return () => clearTimeout(delay);
    // }, [searchQuery]);

    // useEffect(() => {
    //     const handleClickOutside = (e) => {
    //         if (searchRef.current && !searchRef.current.contains(e.target)) {
    //             setShowSearch(false);
    //         }
    //     };

    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () =>
    //         document.removeEventListener("mousedown", handleClickOutside);
    // }, []);

    return (
        <nav className="navbar">
            {/* 🔵 LEFT – LOGO */}
            <div className="navbar-left">
                <Link to="/home" className="logo">
                    SocialHub
                </Link>
            </div>

            {/* 🟡 CENTER – SEARCH */}
            <div className="navbar-center">
                <SearchBar />
            </div>

            {/* 🔴 RIGHT – NOTIFICATIONS + PROFILE */}
            <div className="navbar-right">
                {/* 🔔 NOTIFICATIONS */}
                <div className="notification-wrapper" ref={notificationRef}>
                    <span className="notification-bell" onClick={toggleNotifications}>
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
                                {notifications.length > 0 && (
                                    <button onClick={clearNotifications}>Clear</button>
                                )}
                            </div>

                            <div className="notification-list">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            className={`notification-item ${n.isRead ? "" : "unread"
                                                }`}
                                            onClick={() =>
                                                navigate(`/profile/${n.sender._id}`)
                                            }
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
                    <div
                        className="profile-wrapper"
                        onClick={() => navigate(`/profile/${user._id}`)}
                    >
                        <img
                            src={user.profilePicture || "/assets/images/avatar.webp"}
                            alt="User"
                            className="profile-img"
                        />

                        <span
                            className={`status-dot ${onlineUsers[user._id] ? "online" : "offline"
                                }`}
                        />

                        {/* 👇 Hover tooltip */}
                        <div className="profile-tooltip">
                            <strong>@{user.username}</strong>
                        </div>
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
