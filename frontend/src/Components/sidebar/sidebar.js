import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import SearchBar from "../searchBar/searchBar";
import { RiHome4Line } from "react-icons/ri";
import { RiTelegram2Line } from "react-icons/ri";
import { FiPlusCircle } from "react-icons/fi";
import { BiLike } from "react-icons/bi";
import { IoBookmarkOutline } from "react-icons/io5";
import { IoSearchSharp } from "react-icons/io5";
import MobileSearchOverlay from "../mobileSearchOverlay/mobileSearchOverlay";
import { useState } from "react";


import "./sidebar.css";

const Sidebar = ({ openCreatePost }) => {
  const { user } = useAuth();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <>
      <div className="sidebar">
        <ul>
          <li>
            <NavLink to="/home" className="navLink">
              <div className="iconBox">
                <RiHome4Line />
              </div>
              <span>Home</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/saved" className="navLink">
              <div className="iconBox">
                <IoBookmarkOutline />
              </div>
              <span>Saved</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/liked" className="navLink">
              <div className="iconBox">
                <BiLike />
              </div>
              <span>Liked</span>
            </NavLink>
          </li>

          <li>
            <button className="navLink" onClick={openCreatePost}>
              <div className="iconBox">
                <FiPlusCircle />
              </div>
              <span>Create</span>
            </button>
          </li>
          <li className="mobile-search-icon">
            <button className="navLink" onClick={() => setShowMobileSearch(true)}>
              <div className="iconBox">
                <IoSearchSharp />
              </div>
              <span>Search</span>
            </button>
          </li>


          <li>
            <NavLink to="/messages" className="navLink">
              <div className="iconBox">
                <RiTelegram2Line />
              </div>
              <span>Messages</span>
            </NavLink>
          </li>

          <li className="profileItem">
            <NavLink to={`/profile/${user?._id}`} className="navLink">
              <div className="iconBox">
                <img
                  src={user?.profilePicture || "/assets/images/avatar.webp"}
                  alt="profile"
                  className="profileAvatarSideBar"
                />
              </div>
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </div>
      <MobileSearchOverlay
        open={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
      />
    </>
  );
};

export default Sidebar;
