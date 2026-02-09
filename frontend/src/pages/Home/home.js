import { useState } from "react";
import Feeds from "../../Components/feeds/feeds";
import CreatePost from "../../Components/createPost/createPost";
import HomeLayout from "../homeLayout/homeLayout";
import "./home.css";

export default function Home() {
  const [refresh, setRefresh] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <HomeLayout>
      {showCreate && (
        <CreatePost
          onClose={() => setShowCreate(false)}
          onPostCreated={() => setRefresh(p => !p)}
        />
      )}

      <Feeds
        refresh={refresh}
        onPostDeleted={() => setRefresh(p => !p)}
      />
    </HomeLayout>
  );
}
