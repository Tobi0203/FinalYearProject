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
      console.log("✅ Socket user registered:", user._id);
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

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
