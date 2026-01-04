import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { useAuth } from "./authContext";
import socket from "../utils/socket";
import axiosIns from "../utils/axiosInstance";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    // 🔹 Fetch notifications from DB on login
    useEffect(() => {
        if (!user?._id) return;

        const fetchNotifications = async () => {
            try {
                const res = await axiosIns.get("/notifications");
                if (res.data.success) {
                    setNotifications(res.data.notifications);
                }
            } catch (error) {
                console.error("Fetch notifications error:", error);
            }
        };

        fetchNotifications();
    }, [user]);
    useEffect(() => {
        if (!user?._id) return;

        socket.on("commentNotification", (notification) => {
            console.log("🔔 New notification received:", notification);

            setNotifications((prev) => [
                notification,
                ...prev,
            ]);
        });

        return () => {
            socket.off("newNotification");
        };
    }, [user]);

    useEffect(() => {
        if (!user?._id) return;

        socket.on("likeNotification", (data) => {
            setNotifications((prev) => [
                {
                    _id: data._id,
                    type: data.type,
                    message: data.message,   // 🔑 REQUIRED
                    sender: data.sender,
                    createdAt: data.createdAt,
                },
                ...prev,
            ]);
        });


        return () => {
            socket.off("likeNotification");
        };
    }, [user]);

    // 🔹 Real-time follow notification
    useEffect(() => {
        if (!user?._id) return;

        socket.on("followUpdate", (data) => {
            setNotifications((prev) => [
                {
                    _id: data._id,
                    type: data.type,
                    message: data.message,   // 🔑 REQUIRED
                    sender: data.sender,
                    createdAt: data.createdAt,
                },
                ...prev,
            ]);
        })

        return () => {
            socket.off("followUpdate");
        };
    }, [user]);

    const clearNotifications = () => {
        setNotifications([]);
    };
    const markNotificationsAsRead = async () => {
        try {
            await axiosIns.put("/notifications/mark-read");

            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
            );
        } catch (error) {
            console.error("Mark read error", error);
        }
    };


    return (
        <NotificationContext.Provider
            value={{ notifications, setNotifications, clearNotifications, markNotificationsAsRead }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
