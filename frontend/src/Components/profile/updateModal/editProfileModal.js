import { useState } from "react";
import axiosIns from "../../../utils/axiosInstance";
import "./editProfileModal.css";

const EditProfileModal = ({ profile, closeModal, onUpdate }) => {
  const [form, setForm] = useState({
    name: profile.name || "",
    username: profile.username || "",
    bio: profile.bio || "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(profile.profilePicture || "");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    console.log("SAVE HANDLER CALLED"); // 🔥 debug confirmation
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("bio", form.bio);

      if (image) {
        formData.append("profilePicture", image);
      }

      const res = await axiosIns.put(
        "/users/updateProfile",
        formData,
        {
          headers: {
            "Content-Type": undefined, // 🔥 critical for multer
          },
        }
      );

      if (res.data.success) {
        onUpdate(res.data.user);
        closeModal();
      }
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePicture = async () => {
    try {
      setLoading(true);
      const res = await axiosIns.put("/users/removeProfilePicture");
      if (res.data.success) {
        onUpdate(res.data.user);
        setPreview("");
        setImage(null);
        closeModal();
      }
    } catch (error) {
      console.error("REMOVE IMAGE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalOverlay" onClick={closeModal}>
      <div
        className="editModal"
        onClick={(e) => e.stopPropagation()} // 🔥 prevent overlay click
      >
        <div className="modalHeader">
          <h3>Edit Profile</h3>
          <span className="closeBtn" onClick={closeModal}>✕</span>
        </div>

        {/* 🔥 Avatar Upload */}
        <label className="avatarUpload">
          <img
            src={preview || "/assets/images/avatar.webp"}
            alt="profile"
          />
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        {profile.profilePicture && (
          <button
            type="button"
            className="removePicBtn"
            onClick={handleRemovePicture}
            disabled={loading}
          >
            Remove profile picture
          </button>
        )}

        <div className="modalBody">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />

          <textarea
            name="bio"
            placeholder="Bio"
            value={form.bio}
            onChange={handleChange}
          />
        </div>

        <button
          type="button"
          className="saveBtn"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal;
