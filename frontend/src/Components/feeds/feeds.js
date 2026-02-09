import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosIns from "../../Utils/AxiosInstance";
import { useAuth } from "../../Context/AuthContext";
import "./Feeds.css";
import { AiOutlineDelete } from "react-icons/ai";
import { FcLike } from "react-icons/fc";
import { FaRegHeart } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa6";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { BsThreeDotsVertical } from "react-icons/bs";
import { PiShareFat } from "react-icons/pi";
import CreatePost from "../CreatePost/CreatePost";
import ShareModal from "../ShareModal/ShareModal";
import socket from "../../Utils/Socket"
import { toast } from "react-toastify";

const Feeds = ({ refresh, onPostDeleted, externalPosts, onUnsave, onUnlike }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [sharePost, setSharePost] = useState(null);



  const fetchPosts = async () => {
    try {
      const res = await axiosIns.get("/posts/allPosts");
      // console.log(res.data);
      if (res.data.success) {
        // console.log("form feeds")
        setPosts(res.data.posts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error("Feed fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axiosIns.put(`/posts/toggleLike/${postId}`);

      // Update UI without refetch
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
              ...post,
              likes: post.likes.includes(user._id)
                ? post.likes.filter((id) => id !== user._id)
                : [...post.likes, user._id],
            }
            : post
        )
      );
      if (externalPosts && res.data.liked === false) {
        onUnlike?.(postId);
      }
    } catch (error) {
      console.error("Like toggle error:", error);
    }
  };
  const toggleComments = (postId) => {
    setOpenCommentsPostId((prev) =>
      prev === postId ? null : postId
    );
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      // optimistic UI
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
              ...post,
              comments: [
                ...(post.comments || []),
                {
                  user: { _id: user._id, username: user.username },
                  text: commentText,
                },
              ],
            }
            : post
        )
      );

      setCommentText("");

      await axiosIns.post(`/posts/addComment/${postId}`, {
        text: commentText,
      });
    } catch (error) {
      console.error("Add comment error:", error);
    }
  };
  const handleDeleteComment = async (postId, commentId) => {
    try {
      // optimistic UI
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
              ...post,
              comments: post.comments.filter(
                (c) => c._id !== commentId
              ),
            }
            : post
        )
      );

      await axiosIns.delete(
        `/posts/deleteComment/${postId}/${commentId}`
      );
    } catch (error) {
      console.error("Delete comment error:", error);
    }
  };
  const handleDelete = async (postId) => {
    try {
      const res = await axiosIns.delete(`/posts/deletePost/${postId}`);

      if (res.data.success) {
        toast.success("Post deleted");

        // ✅ LOCAL OPTIMISTIC DELETE
        setPosts((prev) =>
          prev.filter((post) => post._id !== postId)
        );

        // ❌ REMOVE THIS
        onPostDeleted?.();
      }
    } catch (err) {
      toast.error("You are not allowed to delete this post");
    }
  };

  useEffect(() => {
    socket.on("postCreation", ({ post, userId }) => {
      setPosts((prev) => [
        post,
        ...prev
      ])
    })
    return () => socket.off("postCreation")
  }, [])

  const handleSave = async (postId) => {
    try {
      const res = await axiosIns.put(`/posts/toggleSave/${postId}`);

      // optimistic UI update
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
              ...post,
              saves: post.saves?.includes(user._id)
                ? post.saves.filter((id) => id !== user._id)
                : [...(post.saves || []), user._id],
            }
            : post
        )
      );
      if (externalPosts && res.data.saved === false) {
        onUnsave?.(postId);
      }
    } catch (error) {
      toast.error("Failed to save post");
    }
  };

  useEffect(() => {
    socket.on("postDelete", ({ postId, actionUserId }) => {
      if (actionUserId === user?._id) return;
      setPosts((prev) =>
        prev.filter((post) => post._id !== postId)
      );
    })
    return () => socket.off("postDelete")
  }, [user?._id])
  // 🔥 STEP 2: RECEIVE PRIVATE POSTS AFTER FOLLOW (REAL-TIME)
  useEffect(() => {
    socket.on("privatePostsOnFollow", ({ posts }) => {
      if (!posts || posts.length === 0) return;

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));

        const newPosts = posts.filter(
          (p) => !existingIds.has(p._id)
        );

        // add private posts on top
        return [...newPosts, ...prev];
      });
    });

    return () => socket.off("privatePostsOnFollow");
  }, []);
  // 🔥 STEP 3: REMOVE PRIVATE POSTS ON UNFOLLOW
  useEffect(() => {
    socket.on("removePrivatePosts", ({ targetUserId }) => {
      setPosts((prev) =>
        prev.filter(
          (post) =>
            !(
              post.author?._id === targetUserId &&
              post.privacy === "private"
            )
        )
      );
    });

    return () => socket.off("removePrivatePosts");
  }, []);


  useEffect(() => {
    if (externalPosts) {
      setPosts(externalPosts);
      setLoading(false);
    }
    else {
      fetchPosts()
    }
  }, [refresh, externalPosts]);

  useEffect(() => {
    socket.on("postLikeUpdated", ({ postId, likesCount, actionUserId }) => {
      if (actionUserId === user?._id) return;
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== postId) return post;

          // keep current user's like if exists
          const isLikedByMe = post.likes.includes(user?._id);

          return {
            ...post,
            likes: isLikedByMe
              ? [user._id, ...Array(likesCount - 1).fill("x")]
              : Array(likesCount).fill("x"),
          };
        })
      );
    });

    return () => socket.off("postLikeUpdated");
  }, [user]);

  useEffect(() => {
    socket.on("postCommentAdded", ({ postId, comment, actionUserId }) => {
      // optional: ignore my own socket event if you already optimistically add
      if (actionUserId === user?._id) return;

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
              ...post,
              comments: [...(post.comments || []), comment],
            }
            : post
        )
      );
    });

    return () => socket.off("postCommentAdded");
  }, [user]);
  useEffect(() => {
    socket.on(
      "commentDeleted",
      ({ postId, commentId, actionUserId }) => {

        if (actionUserId === user?._id) return;

        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post._id !== postId) return post;

            return {
              ...post,
              comments: (post.comments || []).filter(
                (c) => c._id !== commentId
              ),
            };
          })
        );
      }
    );

    return () => socket.off("postCommentDeleted");
  }, [user]);
  useEffect(() => {
    const closeMenu = () => setOpenMenuPostId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  if (loading) return <p>Loading feed...</p>;

  return (
    <div className="feed">
      {editingPost && (
        <CreatePost
          mode="edit"
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={(updatedPost) => {
            setPosts((prev) =>
              prev.map((p) =>
                p._id === updatedPost._id ? updatedPost : p
              )
            );
          }}
        />
      )}

      {posts.map((post) => {
        const isLiked = post.likes?.includes(user?._id);
        const isAuthor = post.author?._id === user?._id;
        return (
          <div className="post-card" key={post._id}>
            <div className="post-header">
              <strong>{post.author?.username}</strong>

              {isAuthor && (
                <div className="post-menu-wrapper">
                  <BsThreeDotsVertical
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuPostId(
                        openMenuPostId === post._id ? null : post._id
                      );
                    }}
                  />

                  {openMenuPostId === post._id && (
                    <div className="post-menu">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPost(post);
                          setOpenMenuPostId(null);

                        }}
                      >
                        Edit
                      </button>


                      <button
                        className="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(post._id);
                          setOpenMenuPostId(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>


            <div
              className="post-click-area"
              onClick={() => navigate(`/post/${post._id}`)}
            >
              {post.media?.[0] && (
                <img src={post.media[0].url} alt="post" />
              )}

              <p>{post.caption}</p>
            </div>


            {/* <p>{post.caption}</p> */}

            <div className="post-footer">
              <div className="left-actions">
                <span
                  onClick={() => {
                    if (!isAuthor) handleLike(post._id);
                  }}
                  style={{
                    cursor: isAuthor ? "not-allowed" : "pointer",
                    opacity: isAuthor ? 0.5 : 1,
                  }}
                >
                  {isLiked ? <FcLike /> : <FaRegHeart />} {post.likes.length}
                </span>

                <span
                  className="comment-icon"
                  onClick={() => toggleComments(post._id)}
                  style={{ cursor: "pointer" }}
                >
                  <FaRegCommentDots /> {post.comments?.length || 0}
                </span>
                <span
                  onClick={() => {
                    if (post.visibility !== "private") {
                      setSharePost(post);
                    }
                  }}
                  style={{
                    cursor: post.visibility === "private" ? "not-allowed" : "pointer",
                    opacity: post.visibility === "private" ? 0.5 : 1
                  }}
                >
                  <PiShareFat />
                </span>

                {sharePost && (
                  <ShareModal
                    post={sharePost}
                    onClose={() => setSharePost(null)}
                  />
                )}
              </div>

              <div className="right-actions">
                <span onClick={() => handleSave(post._id)}>
                  {post.saves?.includes(user?._id) ? (
                    <BsBookmarkFill className="saveIcon saved" />
                  ) : (
                    <BsBookmark className="saveIcon" />
                  )}
                </span>
              </div>
            </div>


            {openCommentsPostId === post._id && (
              <div className="comments-section">
                <div className="comments-list">
                  {post.comments && post.comments.length > 0 ? (
                    [...(post.comments || [])].reverse().map((comment) => {
                      const isCommentAuthor = comment.user?._id === user?._id;

                      return (
                        <div key={comment._id} className="comment">
                          <strong>{comment.user?.username || "User"}:</strong>{" "}
                          {comment.text}

                          {isCommentAuthor && (
                            <span
                              onClick={() =>
                                handleDeleteComment(post._id, comment._id)
                              }
                              className="deleteComment"
                            >
                              <AiOutlineDelete />
                            </span>
                          )}
                        </div>
                      );
                    })

                  ) : (
                    <p>No comments yet</p>
                  )}
                </div>
                <div className="comment-input">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button onClick={() => handleAddComment(post._id)}>
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Feeds;
