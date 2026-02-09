import { useEffect, useState } from "react";
import axiosIns from "../../utils/axiosInstance";
import Feeds from "../../Components/feeds/feeds";
import HomeLayout from "../homeLayout/homeLayout";

export default function Saved() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      const res = await axiosIns.get("/posts/savedPosts");
      setSavedPosts(res.data.posts || []);
      setLoading(false);
    };
    fetchSaved();
  }, []);

  return (
    <HomeLayout>
      {loading ? (
        <p className="emptyFeed">Loading...</p>
      ) : savedPosts.length === 0 ? (
        <p className="emptyFeed">No saved posts</p>
      ) : (
        <Feeds
          externalPosts={savedPosts}
          onUnsave={(postId) =>
            setSavedPosts(prev => prev.filter(p => p._id !== postId))
          }
        />
      )}
    </HomeLayout>
  );
}
