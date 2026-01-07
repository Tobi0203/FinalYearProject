import "./profileHeader.css";

const ProfileHeader = ({ profile, postsCount, isOwnProfile, onFollow, openModal,onEditProfile}) => {



  return (
    <div className="profileHeader">
      <img
        src={profile.profilePicture || "/assets/images/avatar.webp"}
        alt="profile"
        className="profileAvatar"
      />

      <div className="profileInfo">
        <div className="profileTop">
          <h2>{profile.username}</h2>

          {!isOwnProfile && (
            <button className="followBtn" onClick={() => onFollow(profile._id)}>
              {profile.isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}

          {isOwnProfile && (
            <button className="editBtn" onClick={onEditProfile}>
              Edit Profile
            </button>
          )}

        </div>

        <div className="profileStats">
          <span>{postsCount} posts</span>
          <span onClick={() => openModal("followers")}>
            <b>{profile.followersCount}</b> followers
          </span>
          <span onClick={() => openModal("following")}>
            <b>{profile.followingCount}</b> following
          </span>
        </div>

        <p className="profileBio">{profile.bio}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
