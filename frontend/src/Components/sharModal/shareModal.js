import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosIns from "../../utils/axiosInstance";
import { useAuth } from "../../context/authContext";
import "./shareModal.css";

export default function ShareModal({ post, onClose }) {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        axiosIns.get("/conversations").then((res) => {
            setConversations(res.data.conversations);
        });
    }, []);

    const handleSend = async (conversationId) => {
        try {
            await axiosIns.post("/messages/post", {
                conversationId,
                postId: post._id,
            });

            onClose();

            // ✅ Navigate to messages & open conversation
            navigate("/messages", {
                state: { conversationId },
            });
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div className="share-overlay">
            <div className="share-modal">
                <h3>Send post</h3>

                {conversations.map((c) => {
                    const otherUser = c.members?.find(
                        (m) => m._id !== user._id
                    );

                    if (!otherUser) return null;

                    return (
                        <div
                            key={c._id}
                            className="share-user"
                            onClick={() => handleSend(c._id)}
                        >
                            <img src={otherUser.profilePicture || "/assets/images/avatar.webp"} alt="" />
                            <span>{otherUser.username}</span>
                        </div>
                    );
                })}

                <button className="cancel-btn" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
}
