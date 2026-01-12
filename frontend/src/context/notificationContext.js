import React, { createContext, useContext, useEffect, useState } from "react";
import axiosIns from "../utils/axiosInstance";
import socket from "../utils/socket";
import { useAuth } from "./authContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // 🔹 Fetch missed notifications from DB (offline support)
  useEffect(() => {
    if (!user?._id) return;

    const fetchNotifications = async () => {
      try {
        const res = await axiosIns.get("/notifications");
        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
      } catch (error) {
        console.error("❌ Fetch notifications error:", error);
      }
    };

    fetchNotifications();
  }, [user]);

  // 🔹 Real-time notifications (ONE unified listener)
  useEffect(() => {
  if (!user?._id) return;

  const handleRealtimeNotification = (notification) => {
    console.log("🔔 Realtime notification:", notification);
    setNotifications((prev) => [notification, ...prev]);
  };

  socket.on("newNotification", handleRealtimeNotification);

  return () => {
    socket.off("newNotification", handleRealtimeNotification);
  };
}, [user]);


  // 🔹 Clear notifications (UI only)
  const clearNotifications = () => {
    setNotifications([]);
  };

  // 🔹 Mark all notifications as read
  const markNotificationsAsRead = async () => {
    try {
      await axiosIns.put("/notifications/mark-read");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("❌ Mark read error:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        clearNotifications,
        markNotificationsAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
