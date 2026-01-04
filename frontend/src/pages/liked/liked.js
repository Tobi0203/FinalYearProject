import { useEffect, useState } from "react";
import axiosIns from "../../utils/axiosInstance";
import Feeds from "../../Components/feeds/feeds";
import "./liked.css"

const Liked = () => {
    const [likedPosts, setLikedPosts] = useState([]);

    useEffect(() => {
        const fetchLikedPosts = async () => {
            const res = await axiosIns.get("/posts/likedPosts");
            if (res.data.success) {
                setLikedPosts(res.data.posts);
            }
        };
        fetchLikedPosts();
    }, []);

    const handleUnlike = (postId) => {
        setLikedPosts((prev) =>
            prev.filter((post) => post._id !== postId)
        );
    };

    return (
        <div className="likedCont">
            <div className="likedMain">
                <h2>Liked</h2>
                {likedPosts.length > 0 ? (
                    <Feeds
                        externalPosts={likedPosts}
                        onUnlike={handleUnlike}
                    />
                ) : (
                    <p>No liked posts</p>
                )}
            </div>
        </div>
    );
};

export default Liked;
