import { useEffect, useState, useMemo } from "react";
import axiosIns from "../../Utils/AxiosInstance";
import { useAuth } from "../../Context/AuthContext";
import { useOnlineStatus } from "../../Context/OnlineStatusContext";
import socket from "../../Utils/Socket";
export default function Conversations({ setCurrentChat, autoOpenConversationId }) {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const { onlineUsers } = useOnlineStatus();


  /* ================= FETCH CONVERSATIONS ================= */
  useEffect(() => {
    const fetchConvos = async () => {
      const res = await axiosIns.get("/conversations");
      setConversations(res.data.conversations);
    };
    fetchConvos();
  }, []);
  useEffect(() => {
    if (!autoOpenConversationId || conversations.length === 0) return;

    const convo = conversations.find(
      c => c._id === autoOpenConversationId
    );

    if (convo) {
      setCurrentChat(convo);
    }
  }, [autoOpenConversationId, conversations,setCurrentChat]);

  /* ================= REMOVE CONVO WHEN BLOCKED ================= */
  useEffect(() => {
    socket.on("userBlocked", ({ byUserId }) => {
      setConversations(prev =>
        prev.filter(c => !c.members.some(m => m._id === byUserId))
      );
    });
    return () => socket.off("userBlocked");
  }, []);

  /* ================= REAL-TIME SEARCH ================= */
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const otherUser = c.members.find(m => m._id !== user._id);
      return otherUser?.username
        ?.toLowerCase()
        .includes(search.toLowerCase());
    });
  }, [conversations, search, user._id]);

  return (
    <div className="conversations">
      {/* 🔍 SEARCH BAR */}
      <div className="conversationSearch">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 💬 CONVERSATION LIST */}
      <div className="conversationList">
        {filteredConversations.map(c => {
          const otherUser = c.members.find(m => m._id !== user._id);
          const isOnline = onlineUsers[otherUser?._id];

          return (
            <div
              key={c._id}
              className="conversation"
              onClick={() => setCurrentChat(c)}
            >
              <div className="avatarWrapper">
                <img
                  src={otherUser?.profilePicture || "/assets/images/avatar.webp"}
                  alt="profile"
                />
                {isOnline && <span className="onlineDot" />}
              </div>

              <div className="conversationInfo">
                <p>{otherUser?.username}</p>
                <span>{c.lastMessage || "Say hi 👋"}</span>
              </div>
            </div>
          );
        })}

        {filteredConversations.length === 0 && (
          <p className="noResults">No users found</p>
        )}
      </div>
    </div>
  );
}
