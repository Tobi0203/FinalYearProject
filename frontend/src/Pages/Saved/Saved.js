import { useEffect, useState } from "react";
import axiosIns from "../../Utils/AxiosInstance";
import Feeds from "../../Components/Feeds/Feeds";
import HomeLayout from "../HomeLayout/HomeLayout";

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
