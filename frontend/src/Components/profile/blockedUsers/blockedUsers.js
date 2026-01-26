import "./blockedUsers.css";

export default function BlockedUsers({ users, onUnblock }) {
  return (
    <div className="blockedUsers">
      {users.map(user => (
        <div key={user._id} className="blockedUser">
          <div className="blockedUserInfo">
            <img
              src={user.profilePicture || "/assets/images/avatar.webp"}
              alt="profile"
            />
            <span>{user.username}</span>
          </div>

          <button onClick={() => onUnblock(user._id)}>
            Unblock
          </button>
        </div>
      ))}
    </div>
  );
}
