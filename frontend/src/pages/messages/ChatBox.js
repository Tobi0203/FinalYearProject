// src/pages/messages/ChatBox.jsx
import { useEffect, useState, useRef } from "react";
import axiosIns from "../../utils/axiosInstance";
import Message from "./message";
import { useAuth } from "../../context/authContext";
import socket from "../../utils/socket";

export default function ChatBox({ currentChat, onBack, isMobile }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const { user } = useAuth();
  const [blockStatus, setBlockStatus] = useState(null);
  const scrollRef = useRef();

  /* ================= SELECTION STATE ================= */
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const pressTimer = useRef(null);

  /* ================= LONG PRESS HANDLERS ================= */
  const handlePressStart = (messageId) => {
    pressTimer.current = setTimeout(() => {
      setSelectionMode(true);
      setSelectedMessages([messageId]);
    }, 500); // ⏱ long press duration
  };

  const handlePressEnd = () => {
    clearTimeout(pressTimer.current);
  };

  const toggleSelectMessage = (messageId) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  /* ================= EXIT SELECTION MODE ================= */
  useEffect(() => {
    if (selectedMessages.length === 0) {
      setSelectionMode(false);
    }
  }, [selectedMessages]);

  /* ================= FETCH MESSAGES ================= */
  useEffect(() => {
    if (!currentChat) return;

    const fetchMessages = async () => {
      const res = await axiosIns.get(`/messages/${currentChat._id}`);
      setMessages(res.data.messages);
    };

    fetchMessages();
  }, [currentChat]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!text.trim() || blockStatus) return;

    const receiverId = currentChat.members.find(
      (m) => m._id !== user._id
    )._id;

    const res = await axiosIns.post("/messages", {
      conversationId: currentChat._id,
      text,
    });

    const message = res.data.message;

    socket.emit("sendMessage", {
      receiverId,
      message,
    });

    setMessages((prev) => [...prev, message]);
    setText("");
  };

  /* ================= REAL-TIME RECEIVE ================= */
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      if (message.conversationId === currentChat?._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [currentChat]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= BLOCK STATUS ================= */
  useEffect(() => {
    if (!currentChat) return;

    const checkBlockStatus = async () => {
      const res = await axiosIns.get(
        `/messages/block-status/${currentChat._id}`
      );
      setBlockStatus(res.data.status);
    };

    checkBlockStatus();
  }, [currentChat]);

  const otherUser = currentChat?.members?.find(
    (m) => m._id !== user._id
  );

  const deleteSelectedMessages = async () => {
    try {
      await axiosIns.put("/messages/delete-multiple", {
        messageIds: selectedMessages,
      });

      // ✅ HARD REMOVE FROM UI
      setMessages(prev =>
        prev.filter(m => !selectedMessages.includes(m._id))
      );

      setSelectedMessages([]);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };
  useEffect(() => {
    socket.on("multipleMessagesDeleted", ({ messageIds }) => {
      setMessages(prev =>
        prev.filter(m => !messageIds.includes(m._id))
      );
    });

    return () => socket.off("multipleMessagesDeleted");
  }, []);



  /* ================= UI ================= */
  return (
    <div className="chatBox">
      {currentChat ? (
        <>
          {/* ================= HEADER ================= */}
          <div className="chatHeader">
            {selectedMessages.length > 0 ? (
              <div className="selectHeader">
                {/* LEFT */}
                <button
                  className="selectIcon"
                  onClick={() => setSelectedMessages([])}
                >
                  ←
                </button>

                {/* CENTER */}
                <span className="selectCount">
                  {selectedMessages.length}
                </span>

                {/* RIGHT */}
                <div className="selectActions">
                  <button
                    className="selectIcon delete"
                    onClick={deleteSelectedMessages}
                  >
                    🗑
                  </button>
{/* 
                  <button className="selectIcon">↪</button>

                  <button className="selectIcon">⋮</button> */}
                </div>
              </div>
            ) : (
              <div className="chatHeaderUser">
                {isMobile && (
                  <button className="backBtn" onClick={onBack}>←</button>
                )}
                <img
                  src={otherUser?.profilePicture || "/assets/images/avatar.webp"}
                  alt="profile"
                />
                <span>{otherUser?.username}</span>
              </div>
            )}
          </div>

          {/* ================= MESSAGES ================= */}
          <div className="chatMessages">
            {messages.map((m, index) => {
              const isOwn =
                m.sender?._id
                  ? m.sender._id === user._id
                  : m.sender === user._id;

              return (
                <div
                  key={m._id}
                  ref={index === messages.length - 1 ? scrollRef : null}
                  className={`messageRow ${isOwn ? "own" : ""} ${selectedMessages.includes(m._id) ? "selected" : ""
                    }`}
                  onMouseDown={() => isOwn && handlePressStart(m._id)}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={() => isOwn && handlePressStart(m._id)}
                  onTouchEnd={handlePressEnd}
                  onClick={() => {
                    if (!selectionMode || !isOwn) return;
                    toggleSelectMessage(m._id);
                  }}
                >

                  <Message message={m} own={isOwn} />
                </div>
              );
            })}
          </div>

          {/* ================= INPUT ================= */}
          <div className="chatInput">
            {blockStatus === "I_AM_BLOCKED" && (
              <div className="chatBlockedMsg">You’ve been blocked</div>
            )}

            {!blockStatus && selectedMessages.length === 0 && (
              <>
                <div className="textAreaWrapper">
                  <textarea
                    value={text}
                    placeholder="Message..."
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                </div>
                <button onClick={sendMessage}>Send</button>
              </>
            )}
          </div>
        </>
      ) : (
        <p className="emptyChat">Select a conversation</p>
      )}
    </div>
  );
}
