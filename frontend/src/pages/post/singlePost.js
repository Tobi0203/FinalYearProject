import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosIns from "../../Utils/AxiosInstance";
import { useAuth } from "../../Context/AuthContext";

import { FaRegHeart, FaRegCommentDots } from "react-icons/fa";
import { FcLike } from "react-icons/fc";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { AiOutlineDelete } from "react-icons/ai";

import "./SinglePost.css";

const SinglePost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const fromConversationId = location.state?.fromConversationId;


  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  /* ================= FETCH POST ================= */
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosIns.get(`/posts/${postId}`);
        if (res.data.success) {
          setPost(res.data.post);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  /* ================= LIKE ================= */
  const handleLike = async () => {
    try {
      await axiosIns.put(`/posts/toggleLike/${post._id}`);

      setPost((prev) => ({
        ...prev,
        likes: prev.likes.includes(user._id)
          ? prev.likes.filter((id) => id !== user._id)
          : [...prev.likes, user._id],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      await axiosIns.put(`/posts/toggleSave/${post._id}`);

      setPost((prev) => ({
        ...prev,
        saves: prev.saves?.includes(user._id)
          ? prev.saves.filter((id) => id !== user._id)
          : [...(prev.saves || []), user._id],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= ADD COMMENT ================= */
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const tempComment = {
      _id: Date.now(),
      user: { _id: user._id, username: user.username },
      text: commentText,
    };

    setPost((prev) => ({
      ...prev,
      comments: [tempComment, ...prev.comments],
    }));

    setCommentText("");

    try {
      await axiosIns.post(`/posts/addComment/${post._id}`, {
        text: tempComment.text,
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= DELETE COMMENT ================= */
  const handleDeleteComment = async (commentId) => {
    setPost((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c._id !== commentId),
    }));

    try {
      await axiosIns.delete(
        `/posts/deleteComment/${post._id}/${commentId}`
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (!post || !post.author) return <p>Post not found</p>;

  const image = post.media?.[0]?.url || post.media?.[0];
  const isLiked = post.likes.includes(user._id);
  const isSaved = post.saves?.includes(user._id);

  return (

    <div className="singlePostCont">
      <div className="singlePostPage">
        {/* HEADER */}
        <div className="singlePostHeader">
          <button
            onClick={() => {
              if (fromConversationId) {
                navigate("/messages", {
                  state: { conversationId: fromConversationId }
                });
              } else {
                navigate(-1);
              }
            }}
          >
            ←
          </button>

          <span>Post</span>
        </div>

        {/* USER */}
        <div className="singlePostUser">
          <img
            src={post.author.profilePicture || "/assets/images/avatar.webp"}
            alt="user"
          />
          <span>{post.author.username}</span>
        </div>

        {/* MEDIA */}
        {image && (
          <div className="singlePostMedia">
            <img src={image} alt="post" />
          </div>
        )}

        {/* ACTIONS */}
        <div className="singlePostActions">
          <span
            className={isLiked ? "liked" : ""}
            onClick={handleLike}
          >
            {isLiked ? <FcLike /> : <FaRegHeart />} {post.likes.length}
          </span>

          <span>
            <FaRegCommentDots /> {post.comments.length}
          </span>

          <span
            className={isSaved ? "saved" : ""}
            onClick={handleSave}
          >
            {isSaved ? <BsBookmarkFill /> : <BsBookmark />}
          </span>
        </div>

        {/* CAPTION */}
        <div className="singlePostCaption">
          <strong>{post.author.username}</strong> {post.caption}
        </div>

        {/* COMMENTS */}
        <div className="singlePostComments">
          {post.comments.length > 0 ? (
            post.comments.map((c) => (
              <div key={c._id} className="comment">
                <strong>{c.user?.username || "User"}:</strong>{" "}
                {c.text}

                {c.user?._id === user._id && (
                  <AiOutlineDelete
                    className="deleteComment"
                    onClick={() => handleDeleteComment(c._id)}
                  />
                )}
              </div>
            ))
          ) : (
            <p className="noComments">No comments yet</p>
          )}
        </div>

        {/* COMMENT INPUT */}
        <div className="singlePostCommentInput">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
          />
          <button onClick={handleAddComment}>Post</button>
        </div>
      </div>
    </div>
  );
};

export default SinglePost;
