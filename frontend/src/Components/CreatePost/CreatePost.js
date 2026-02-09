import { useEffect, useState } from "react";
import axiosIns from "../../Utils/AxiosInstance";
import "./CreatePost.css";
import { toast } from "react-toastify";

const CreatePost = ({
  onClose,
  onPostCreated,
  mode = "create",          // "create" | "edit"
  post = null,              // only for edit
  onPostUpdated,
}) => {
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState(null);
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);

  // 🔥 PREFILL DATA FOR EDIT MODE
  useEffect(() => {
    if (mode === "edit" && post) {
      setCaption(post.caption || "");
      setExistingMedia(post.media?.[0] || null);
      setPrivacy(post.privacy || "public");
    }
  }, [mode, post]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
    setExistingMedia(null); // replace old media
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!caption && files.length === 0 && !existingMedia) {
      return toast.error("Post cannot be empty");
    }

    const formData = new FormData();
    formData.append("caption", caption);

    if (mode === "create") {
      formData.append("privacy", privacy);
    }

    if (files.length > 0) {
      formData.append("media", files[0]); // replace image
    }

    try {
      setLoading(true);

      const res =
        mode === "create"
          ? await axiosIns.post("/posts/createPost", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          : await axiosIns.put(
              `/posts/editPost/${post._id}`,
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );

      if (res.data.success) {
        toast.success(
          mode === "create"
            ? "Post created successfully"
            : "Post updated successfully"
        );

        if (mode === "create") {
          onPostCreated?.();
        } else {
          onPostUpdated?.(res.data.post);
        }

        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="createPostOverlay" onClick={onClose}>
      <div className="createPostBox" onClick={(e) => e.stopPropagation()}>
        <h3>{mode === "create" ? "Create Post" : "Edit Post"}</h3>

        <textarea
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* 🔒 PRIVACY ONLY FOR CREATE */}
        {mode === "create" && (
          <div className="privacySelect">
            <label>Post visibility</label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        )}

        {/* 📁 FILE UPLOAD */}
        <label className="fileUpload">
          {mode === "create" ? "Select media" : "Change media"}
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            hidden
          />
        </label>

        {/* 🔥 EXISTING IMAGE (EDIT MODE) */}
        {mode === "edit" && existingMedia && files.length === 0 && (
          <div className="preview">
            <img src={existingMedia.url} alt="existing" />
          </div>
        )}

        {/* 🔥 NEW IMAGE PREVIEW */}
        {files.length > 0 && (
          <div className="preview">
            {files.map((file, i) => (
              <img
                key={i}
                src={URL.createObjectURL(file)}
                alt="preview"
              />
            ))}
          </div>
        )}

        <div className="actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}>
            {loading
              ? mode === "create"
                ? "Posting..."
                : "Saving..."
              : mode === "create"
              ? "Post"
              : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
