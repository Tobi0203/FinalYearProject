// src/pages/messages/Conversations.jsx
import { useEffect, useState } from "react";
import axiosIns from "../../utils/axiosInstance";
import { useAuth } from "../../context/authContext";
import { useOnlineStatus } from "../../context/onlineStatusContext";


export default function Conversations({ setCurrentChat }) {
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();
  const { onlineUsers } = useOnlineStatus();

  useEffect(() => {
    const fetchConvos = async () => {
      const res = await axiosIns.get("/conversations");
      setConversations(res.data.conversations);
    };
    fetchConvos();
  }, []);

  return (
    <div className="conversations">
      {conversations.map(c => {
        const otherUser = c.members.find(m => m._id !== user._id);
        const isOnline = onlineUsers[otherUser._id];

        return (
          <div
            key={c._id}
            className="conversation"
            onClick={() => setCurrentChat(c)}
          >
            {/* Avatar wrapper */}
            <div className="avatarWrapper">
              <img
                src={otherUser.profilePicture || "/assets/images/avatar.webp"}
                alt="profile"
              />

              {/* 🟢 ONLINE DOT */}
              {isOnline && <span className="onlineDot" />}
            </div>

            <div className="conversationInfo">
              <p>{otherUser.username}</p>
              <span>{c.lastMessage}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

