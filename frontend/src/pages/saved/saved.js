import { useEffect, useState } from "react";
import axiosIns from "../../utils/axiosInstance";
import Feeds from "../../Components/feeds/feeds";
import "./saved.css"

const Saved = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleUnsave = (postId) => {
    setSavedPosts((prev) =>
      prev.filter((post) => post._id !== postId)
    );
  };

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const res = await axiosIns.get("/posts/savedPosts");
        if (res.data.success) {
          setSavedPosts(res.data.posts);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  if (loading) return <p>Loading saved posts...</p>;

  return (
    <div className="savedCont">
      <div className="savedMain">
        <h2>Saved</h2>
        {savedPosts.length > 0 ? (
          <Feeds externalPosts={savedPosts} onUnsave={handleUnsave} />
        ) : (
          <p>No saved posts yet</p>
        )}
      </div>
    </div>
  );
};

export default Saved;
