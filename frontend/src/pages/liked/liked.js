import { useEffect, useState } from "react";
import axiosIns from "../../utils/axiosInstance";
import Feeds from "../../Components/feeds/feeds";
import HomeLayout from "../homeLayout/homeLayout";

export default function Liked() {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiked = async () => {
      const res = await axiosIns.get("/posts/likedPosts");
      setLikedPosts(res.data.posts || []);
      setLoading(false);
    };
    fetchLiked();
  }, []);

  return (
    <HomeLayout>
      {loading ? (
        <p className="emptyFeed">Loading...</p>
      ) : likedPosts.length === 0 ? (
        <p className="emptyFeed">No liked posts</p>
      ) : (
        <Feeds
          externalPosts={likedPosts}
          onUnlike={(postId) =>
            setLikedPosts(prev => prev.filter(p => p._id !== postId))
          }
        />
      )}
    </HomeLayout>
  );
}
