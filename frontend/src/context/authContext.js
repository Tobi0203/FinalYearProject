import React, { createContext, useContext, useEffect, useState } from "react";
import axiosIns from "../utils/axiosInstance";
import socket from "../utils/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch logged-in user
  const fetchCurrentUser = async () => {
    try {
      const res = await axiosIns.get("/users/current");
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // 🔹 Register user with socket (ONCE, SAFE)
  useEffect(() => {
    if (!user?._id) return;

    const registerSocketUser = () => {
      socket.emit("addUser", user._id);
      // console.log("✅ Socket user registered:", user._id);
    };

    // if socket already connected
    if (socket.connected) {
      registerSocketUser();
    }

    // when socket connects later
    socket.on("connect", registerSocketUser);

    return () => {
      socket.off("connect", registerSocketUser);
    };
  }, [user]);

  const logout = async () => {
    await axiosIns.post("/auth/logout");
    setUser(null);
  };
  useEffect(() => {
    if (!user?._id) return;

    const handleFollowRequest = (newUser) => {
      setUser((prev) => ({
        ...prev,
        followRequests: [...(prev.followRequests || []), newUser],
      }));
    };

    socket.on("followRequest", handleFollowRequest);

    return () => {
      socket.off("followRequest", handleFollowRequest);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const handleFollowRequestAccepted = ({ targetUserId }) => {
      setUser(prev => ({
        ...prev,
        sentRequests: (prev.sentRequests || []).filter(
          id => id !== targetUserId
        ),
        following: [...(prev.following || []), targetUserId],
      }));
    };

    socket.on("followRequestAccepted", handleFollowRequestAccepted);

    return () => {
      socket.off("followRequestAccepted", handleFollowRequestAccepted);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const handleFollowRequestDeclined = ({ targetUserId }) => {
      setUser(prev => ({
        ...prev,
        sentRequests: (prev.sentRequests || []).filter(
          id => id !== targetUserId
        ),
      }));
    };

    socket.on("followRequestDeclined", handleFollowRequestDeclined);

    return () => {
      socket.off("followRequestDeclined", handleFollowRequestDeclined);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;

    const handleFollowUpdate = ({ targetUserId, actionUserId, isFollowing }) => {
      if (actionUserId !== user._id) return;

      setUser(prev => ({
        ...prev,
        following: isFollowing
          ? [...(prev.following || []), targetUserId]
          : prev.following.filter(id => id !== targetUserId),
      }));
    };

    socket.on("followUpdate", handleFollowUpdate);
    return () => socket.off("followUpdate", handleFollowUpdate);
  }, [user?._id]);


  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
