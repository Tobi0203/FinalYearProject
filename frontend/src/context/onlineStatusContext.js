import { createContext, useContext, useEffect, useState } from "react";
import socket from "../utils/socket";

const OnlineStatusContext = createContext();

export const OnlineStatusProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
  socket.on("onlineUsers", (users) => {
    const map = {};
    users.forEach((id) => {
      map[id] = true;
    });
    setOnlineUsers(map);
  });

  socket.on("onlineStatus", ({ userId, isOnline }) => {
    setOnlineUsers((prev) => ({
      ...prev,
      [userId]: isOnline,
    }));
  });

  return () => {
    socket.off("onlineUsers");
    socket.off("onlineStatus");
  };
}, []);

  return (
    <OnlineStatusContext.Provider value={{ onlineUsers }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = () =>
  useContext(OnlineStatusContext);
