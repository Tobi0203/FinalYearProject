import "./profileTabs.css";

const ProfileTabs = ({ activeTab, setActiveTab, isOwnProfile }) => {
  return (
    <div className="profileTabs">
      <button
        className={activeTab === "posts" ? "tab active" : "tab"}
        onClick={() => setActiveTab("posts")}
      >
        Posts
      </button>

      {isOwnProfile && (
        <>
          <button
            className={activeTab === "saved" ? "tab active" : "tab"}
            onClick={() => setActiveTab("saved")}
          >
            Saved
          </button>

          <button
            className={activeTab === "liked" ? "tab active" : "tab"}
            onClick={() => setActiveTab("liked")}
          >
            Liked
          </button>
          <button
            className={activeTab === "blocked" ? "tab active" : "tab"}
            onClick={() => setActiveTab("blocked")}
          >
            Blocked
          </button>
        </>
      )}
    </div>
  );
};

export default ProfileTabs;
