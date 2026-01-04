import { useState } from "react";
import axiosIns from "../../utils/axiosInstance";
import "./createPost.css";
import { toast } from "react-toastify";

const CreatePost = ({ onClose, onPostCreated }) => {
    const [caption, setCaption] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!caption && files.length === 0) {
            return alert("Post cannot be empty");
        }

        const formData = new FormData();
        formData.append("caption", caption);
        files.forEach((file) => formData.append("media", file));

        try {
            setLoading(true);
            const res = await axiosIns.post("/posts/createPost", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log(res)

            if (res.data.success) {
                onPostCreated && onPostCreated(); // refresh feed
                onClose();
                toast.success("post created successfilly")
                
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="createPostOverlay" onClick={onClose}  >
            <div className="createPostBox" onClick={(e) => e.stopPropagation()}>
                <h3>Create Post</h3>

                <textarea
                    placeholder="What's on your mind?"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                />

                <label className="fileUpload">
                    Select media
                    <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        hidden
                    />
                </label>

                {files.length > 0 && (
                    <p className="fileCount">{files.length} file(s) selected</p>
                )}


                <div className="preview">
                    {files.map((file, i) => (
                        <img
                            key={i}
                            src={URL.createObjectURL(file)}
                            alt="preview"
                        />
                    ))}
                </div>

                <div className="actions">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
