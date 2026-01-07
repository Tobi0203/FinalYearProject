import { useState, useMemo } from "react";
import "./followersModal.css";
import axiosIns from "../../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const FollowersModal = ({
  type,
  users,
  closeModal,
  isOwnProfile,
  onRemove,
  onUnFollow,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleRemove = async (followerId) => {
    try {
      const res = await axiosIns.put(`/users/removeFollower/${followerId}`);
      if (res.data.success) {
        onRemove(followerId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNavigate = (userId) => {
    navigate(`/profile/${userId}`);
    closeModal();
  };

  /* 🔍 EXACT Navbar-style real-time search */
  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="modalOverlay" onClick={closeModal}>
      <div
        className="modalBox"
        onClick={(e) => e.stopPropagation()} // 🔥 prevent close on inner click
      >
        <div className="modalHeader">
          <h3>{type === "followers" ? "Followers" : "Following"}</h3>
          <span className="closeBtn" onClick={closeModal}>✕</span>
        </div>

        {/* 🔍 Search input */}
        <input
          type="text"
          placeholder="Search"
          className="modalSearch"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="modalList">
          {filteredUsers.length === 0 && (
            <p className="emptyText">No users found</p>
          )}

          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="modalUser"
              onClick={() => handleNavigate(user._id)}
            >
              <img
                src={user.profilePicture || "/assets/images/avatar.webp"}
                alt="profile"
              />

              <div className="userInfo">
                <span className="username">{user.username}</span>
                <span className="name">{user.name}</span>
              </div>

              {isOwnProfile && type === "followers" && (
                <button
                  className="removeBtn"
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 prevent navigation
                    handleRemove(user._id);
                  }}
                >
                  Remove
                </button>
              )}

              {isOwnProfile && type === "following" && (
                <button
                  className="followBtn"
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 prevent navigation
                    onUnFollow(user._id);
                  }}
                >
                  Unfollow
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
