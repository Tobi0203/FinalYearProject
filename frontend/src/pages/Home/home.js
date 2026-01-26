import React, { useState } from "react";
import Feeds from "../../Components/feeds/feeds";
import Navbar from "../../Components/Navbar/navbar";
import Sidebar from "../../Components/Sidebar/sidebar";
import Suggestions from "../../Components/suggestions/suggestions";
import CreatePost from "../../Components/createPost/createPost";
import "./home.css";

const Home = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshFeed, setRefreshFeed] = useState(false);

  const handlePostCreated = () => {
    setRefreshFeed(prev => !prev); // 🔥 trigger refresh
  };

  return (
    <>
      <Navbar />

      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      <div className="home">
        <Sidebar openCreatePost={() => setShowCreatePost(true)} />
        <Feeds refresh={refreshFeed} onPostDeleted={() => setRefreshFeed(prev => !prev)} />
        <Suggestions />
      </div>
    </>
  );
};

export default Home;
