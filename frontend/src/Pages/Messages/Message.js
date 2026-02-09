import { useNavigate } from "react-router-dom";

export default function Message({ message, own }) {
  const navigate = useNavigate();

  // ✅ DELETED MESSAGE
  if (message.isDeleted) {
    return (
      <div className={`message ${own ? "own" : ""} deleted`}>
        <i>Message deleted</i>
      </div>
    );
  }

  // 🟦 POST MESSAGE
  if (message.type === "post" && message.post) {
    const image =
      message.post.media?.[0]?.url || message.post.media?.[0];

    return (
      <div className={`messageRow ${own ? "own" : ""}`}>
        <div className="postMessageWrapper">
          <div
            className="postMessageCard"
            onClick={() =>
              navigate(`/post/${message.post._id}`, {
                state: { fromConversationId: message.conversationId },
              })
            }
          >
            {/* HEADER */}
            <div className="postMsgHeader">
              <img
                src={
                  message.post.author?.profilePicture ||
                  "/assets/images/avatar.webp"
                }
                alt="user"
              />
              <span>{message.post.author?.username}</span>
            </div>

            {/* IMAGE */}
            {image && (
              <div className="postMsgImage">
                <img src={image} alt="post" />
              </div>
            )}

            {/* CAPTION */}
            {message.post.caption && (
              <div className="postMsgCaption">
                {message.post.caption}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 🟦 NORMAL TEXT MESSAGE
  return (
    <div className={`message ${own ? "own" : ""}`}>
      <div className="messageText">{message.text}</div>
    </div>
  );
}
