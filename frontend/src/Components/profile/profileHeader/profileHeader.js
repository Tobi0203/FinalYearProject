import "./profileHeader.css";

const ProfileHeader = ({ profile, user, postsCount, isOwnProfile, onFollow, onAccept, onDecline, openModal, onEditProfile }) => {
  const hasIncomingRequest = user?.followRequests?.some(
    (r) => (r._id || r).toString() === profile._id
  );

  const getFollowText = () => {
    if (user?.following?.includes(profile._id)) return "Unfollow";
    if (user?.sentRequests?.includes(profile._id)) return "Requested";
    return "Follow";
  };


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

          {/* 🔒 INCOMING REQUEST → ACCEPT / DECLINE */}
          {!isOwnProfile && hasIncomingRequest && (
            <div className="requestActions">
              <button
                className="acceptBtn"
                onClick={() => onAccept(profile._id)}
              >
                Accept
              </button>

              <button
                className="declineBtn"
                onClick={() => onDecline(profile._id)}
              >
                Decline
              </button>
            </div>
          )}

          {/* NORMAL FOLLOW FLOW */}
          {!isOwnProfile && !hasIncomingRequest && (
            <button
              className="followBtn"
              onClick={() => onFollow(profile._id)}
              disabled={user?.sentRequests?.includes(profile._id)}
            >
              {getFollowText()}
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
            <b>
              {isOwnProfile
                ? user?.following?.length || 0
                : profile.followingCount}
            </b>{" "}
            following
          </span>
        </div>

        <p className="profileBio">{profile.bio}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
