import axiosIns from "../../../Utils/AxiosInstance";
import { useNavigate } from "react-router-dom";
import "./ProfilePosts.css";

const ProfilePosts = ({ posts, onUnsave, isSavedTab, onUnLike, isLikedTab }) => {
  const navigate = useNavigate();
  const handleUnsave = async (postId) => {
    try {
      const res = await axiosIns.put(`/posts/toggleSave/${postId}`);
      if (res.data.success) {
        onUnsave(postId); // 🔥 instantly remove from UI
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleUnLike = async (postId) => {
    try {
      const res = await axiosIns.put(`/posts/toggleLike/${postId}`);
      if (res.data.success) {
        onUnLike(postId); // 🔥 instantly remove from UI
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="profilePosts">
      {posts.map((post) => {
        const image =
          post.media?.[0]?.url || post.media?.[0];

        if (!image) return null;

        return (
          <div key={post._id} className="postBox" onClick={() => navigate(`/post/${post._id}`)}>
            <img src={image} alt="post" />

            {isSavedTab && (
              <button
                className="unsaveBtn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnsave(post._id);
                }}
              >
                Unsave
              </button>
            )}
            {isLikedTab && (
              <button
                className="unlikeBtn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnLike(post._id);
                }}
              >
                Unlike
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProfilePosts;
