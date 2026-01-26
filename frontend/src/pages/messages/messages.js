import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Conversations from "./Conversations";
import ChatBox from "./ChatBox";
import socket from "../../utils/socket";
import axiosIns from "../../utils/axiosInstance";
import "./messages.css";

export default function Messages() {
  const navigate = useNavigate();
  const [currentChat, setCurrentChat] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  /* ================= SCREEN SIZE LISTENER ================= */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= LOAD CHAT FROM NAVIGATION ================= */
  useEffect(() => {
    const conversationId = location.state?.conversationId;
    if (!conversationId) return;

    const loadConversation = async () => {
      try {
        const res = await axiosIns.get(`/conversations/${conversationId}`);
        setCurrentChat(res.data.conversation);
        navigate("/messages", { replace: true });
      } catch (err) {
        console.error(err);
      }
    };

    loadConversation();
  }, [location.state?.conversationId,navigate]);




  /* ================= AUTO CLOSE CHAT WHEN BLOCKED ================= */
  useEffect(() => {
    socket.on("userBlocked", ({ byUserId }) => {
      if (currentChat?.members?.some(m => m._id === byUserId)) {
        setCurrentChat(null);
      }
    });

    return () => socket.off("userBlocked");
  }, [currentChat]);

  return (
    <div className="messagesPage">
      {/* 📱 MOBILE LOGIC */}
      {isMobile ? (
        currentChat ? (
          <ChatBox
            currentChat={currentChat}
            onBack={() => setCurrentChat(null)}
            isMobile
          />
        ) : (
          <Conversations
            setCurrentChat={setCurrentChat}
            autoOpenConversationId={location.state?.conversationId}
          />
        )
      ) : (
        <>
          <Conversations
            setCurrentChat={setCurrentChat}
            autoOpenConversationId={location.state?.conversationId}
          />
          <ChatBox currentChat={currentChat} />
        </>
      )}


    </div>
  );
}
