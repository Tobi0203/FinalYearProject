import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosIns from "../../utils/axiosInstance";
import { useOnlineStatus } from "../../context/onlineStatusContext";
import "./suggestions.css";
import socket from "../../utils/socket";

const Suggestions = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { onlineUsers } = useOnlineStatus()



  // Toggle follow / unfollow
  const handleFollow = async (userId) => {
    try {
      const res = await axiosIns.put(`/users/toggleFollow/${userId}`);

      if (!res.data.success) return;

      setUsers((prev) =>
        prev.map((user) => {
          if (user._id !== userId) return user;

          // 🔒 PRIVATE ACCOUNT → REQUEST SENT
          if (res.data.status === "requested") {
            return {
              ...user,
              isFollowing: false, // still NOT following
              isRequested: true,  // optional (for UI)
            };
          }

          // 🟢 PUBLIC FOLLOW / 🔴 UNFOLLOW
          return {
            ...user,
            isFollowing: res.data.follow === true,
            isRequested: false,
          };
        })
      );
    } catch (error) {
      console.error("Follow error", error);
    }
  };


  // Navigate to profile
  const handleNavigate = (userId) => {
    navigate(`/profile/${userId}`);
  };

  useEffect(() => {
    // Fetch suggested users
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axiosIns.get("/users/SuggestedUsers");
        if (res.data.success) {
          setUsers(res.data.users);
        }
      } catch (error) {
        console.error("Suggested users error", error);
      }
    };
    fetchSuggestedUsers();
  }, []);
  useEffect(() => {
    const handleAccepted = ({ targetUserId }) => {
      setUsers(prev =>
        prev.map(user =>
          user._id === targetUserId
            ? {
              ...user,
              isRequested: false,
              isFollowing: true, // 🔥 SHOW UNFOLLOW
            }
            : user
        )
      );
    };

    socket.on("followRequestAccepted", handleAccepted);

    return () => {
      socket.off("followRequestAccepted", handleAccepted);
    };
  }, []);
  useEffect(() => {
    const handleDeclined = ({ targetUserId }) => {
      setUsers(prev =>
        prev.map(user =>
          user._id === targetUserId
            ? {
              ...user,
              isRequested: false,
              isFollowing: false, // 🔥 BACK TO FOLLOW
            }
            : user
        )
      );
    };

    socket.on("followRequestDeclined", handleDeclined);

    return () => {
      socket.off("followRequestDeclined", handleDeclined);
    };
  }, []);


  return (
    <div className="suggestions">
      <h3 className="suggestions-title">
        Suggested for you
      </h3>

      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user._id}
            className="suggestion-user"
            onClick={() => handleNavigate(user._id)}
          >
            <div className="user-info">
              <div className="profileWrapper">
                <img
                  src={
                    user.profilePicture ||
                    "/assets/images/avatar.webp"
                  }
                  alt="user"
                />
                <span
                  className={`status-dot ${onlineUsers[user._id] ? "online" : "offline"
                    }`}
                />
              </div>
              <div>
                <p className="username">
                  {user.username}
                </p>
                <span className="name">
                  {user.name}
                </span>
              </div>
            </div>

            <button
              className={`follow-btn ${user.isFollowing ? "unfollow" : user.isRequested ? "requested" : ""
                }`}
              disabled={user.isRequested}
              onClick={(e) => {
                e.stopPropagation();
                handleFollow(user._id);
              }}
            >
              {user.isFollowing
                ? "Unfollow"
                : user.isRequested
                  ? "Requested"
                  : "Follow"}
            </button>

          </div>
        ))
      ) : (
        <p className="no-suggestions">
          No suggestions
        </p>
      )}
    </div>
  );
};

export default Suggestions;
