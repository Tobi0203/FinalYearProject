// src/pages/messages/ChatBox.jsx
import { useEffect, useState, useRef } from "react";
import axiosIns from "../../utils/axiosInstance";
import Message from "./message";
import { useAuth } from "../../context/authContext";
import socket from "../../utils/socket";

export default function ChatBox({ currentChat }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const { user } = useAuth();
  const scrollRef = useRef();

  useEffect(() => {
    if (!currentChat) return;

    const fetchMessages = async () => {
      // console.log("from chatbox")
      const res = await axiosIns.get(
        `/messages/${currentChat._id}`
      );
      setMessages(res.data.messages);
    };

    fetchMessages();
  }, [currentChat]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const receiverId = currentChat.members.find(
      (m) => m._id !== user._id
    )._id;

    const res = await axiosIns.post("/messages", {
      conversationId: currentChat._id,
      text,
    });

    const message = res.data.message;

    // 🔥 SEND REAL-TIME EVENT
    socket.emit("sendMessage", {
      receiverId,
      message,
    });

    setMessages(prev => [...prev, message]);
    setText("");
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      if (message.conversationId === currentChat?._id) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [currentChat]);


  return (
    <div className="chatBox">
      {currentChat ? (
        <>
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
                  className={`messageRow ${isOwn ? "own" : ""}`}
                >
                  <Message message={m} own={isOwn} />
                </div>
              );
            })}

          </div>


          <div className="chatInput">
            <div className="textAreaWrapper">
              <textarea
                value={text}
                placeholder="Message..."
                onChange={(e) => {
                  setText(e.target.value);

                  const textarea = e.target;
                  const lineHeight = 22;
                  const maxLines = 4;
                  const maxHeight = lineHeight * maxLines;

                  textarea.style.height = "auto";

                  if (textarea.scrollHeight <= maxHeight) {
                    textarea.style.height = textarea.scrollHeight + "px";
                    textarea.style.overflowY = "hidden";
                  } else {
                    textarea.style.height = maxHeight + "px";
                    textarea.style.overflowY = "auto";
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>

            <button onClick={sendMessage}>Send</button>
          </div>

        </>
      ) : (
        <p className="emptyChat">Select a conversation</p>
      )}
    </div>
  );
}
