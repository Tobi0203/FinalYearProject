// src/pages/messages/Messages.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Conversations from "./Conversations";
import ChatBox from "./ChatBox";
import "./messages.css";

export default function Messages() {
  const [currentChat, setCurrentChat] = useState(null);
  const location = useLocation();
  useEffect(() => {
    if (location.state?.conversationId) {
      setCurrentChat({
        _id: location.state.conversationId,
      });
    }
  }, [location.state]);

  return (
    <div className="messagesPage">
      <Conversations setCurrentChat={setCurrentChat} />
      <ChatBox currentChat={currentChat} />
    </div>
  );
}
