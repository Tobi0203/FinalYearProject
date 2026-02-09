import React, { useEffect, useState } from "react";
import "./FollowRequests.css";
import { useAuth } from "../../../Context/AuthContext";
import axiosIns from "../../../Utils/AxiosInstance";

const FollowRequests = () => {
  const { user, setUser } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (user?.followRequests) {
      setRequests(user.followRequests);
      console.log(user.followRequests)
    }
  }, [user]);

  const acceptRequest = async (requesterId) => {
    try {
      const res = await axiosIns.post(
        `/users/follow/accept/${requesterId}`
      );

      console.log(res.data);
      if (res.data.success) {
        // remove request instantly (local UI)
        setRequests(prev =>
          prev.filter(u => u._id !== requesterId)
        );

        // update auth user safely
        setUser(prev => ({
          ...prev,
          followRequests: (prev.followRequests || []).filter(
            u => u._id !== requesterId
          ),
          followers: [...(prev.followers || []), requesterId],
        }));

      }
    } catch (err) {
      console.error(err);
    }
  };



  const declineRequest = async (requesterId) => {
    try {
      const res = await axiosIns.post(
        `/users/follow/decline/${requesterId}`
      );

      if (res.data.success) {
        setRequests((prev) =>
          prev.filter((u) => u._id !== requesterId)
        );

        setUser(prev => ({
          ...prev,
          followRequests: (prev.followRequests || []).filter(
            u => u._id !== requesterId
          ),
        }));

      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!requests.length) return null;

  return (
    <div className="followRequests">
      <h3>Follow Requests</h3>

      {requests.map((reqUser) => (
        <div key={reqUser._id} className="requestItem">
          <div className="requestUser">
            <img
              src={reqUser.profilePicture || "/assets/images/avatar.webp"}
              alt="profile"
              className="requestAvatar"
            />
            <span className="requestUsername">
              {reqUser.username}
            </span>
          </div>

          <div className="requestActions">
            <button
              className="acceptBtn"
              onClick={() => acceptRequest(reqUser._id)}
            >
              Accept
            </button>

            <button
              className="declineBtn"
              onClick={() => declineRequest(reqUser._id)}
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FollowRequests;
