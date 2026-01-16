export default function Message({ message, own }) {
  if (!message) return null; // 🔥 IMPORTANT

  return (
    <div className={`message ${own ? "own" : ""}`}>
      <p>{message.text}</p>
      <span>
        {message.createdAt &&
          new Date(message.createdAt).toLocaleTimeString()}
      </span>
    </div>
  );
}
