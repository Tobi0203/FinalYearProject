import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosIns from "../../utils/axiosInstance";
import socket from "../../utils/socket";
import { useAuth } from "../../context/authContext";
import "./profile.css";

const Profile = () => {
    const { userId } = useParams();
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);




    const handleFollow = async () => {
        try {
            const res = await axiosIns.put(`/users/toggleFollow/${userId}`);
            if (res.data.success) {
                setProfile((prev) => ({
                    ...prev,
                    isFollowing: !prev.isFollowing,
                    followersCount: prev.isFollowing
                        ? prev.followersCount - 1
                        : prev.followersCount + 1,
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosIns.get(`/users/profile/${userId}`);
                if (res.data.success) {
                    setProfile(res.data.user);
                    console.log(res.data.user)
                    setPosts(res.data.posts);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);
    useEffect(() => {
        if (!profile?._id) return;

        const handleFollowUpdate = ({ followerId, isFollowing }) => {
            // only update if this profile is affected
            if (profile._id !== userId) return;

            setProfile((prev) => ({
                ...prev,
                followersCount: isFollowing
                    ? prev.followersCount + 1
                    : prev.followersCount - 1,
                isFollowing,
            }));
        };

        socket.on("followUpdate", handleFollowUpdate);

        return () => {
            socket.off("followUpdate", handleFollowUpdate);
        };
    }, [profile, userId]);


    if (loading) return <p>Loading profile...</p>;
    if (!profile) return <p>User not found</p>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <img
                    src={profile.profilePicture || "/assets/images/avatar.webp"}
                    alt="profile"
                    className="profile-pic"
                />

                <div className="profile-info">
                    <h2>{profile.username}</h2>
                    <p>{profile.bio}</p>

                    <div className="profile-stats">
                        <span>{posts.length} Posts</span>
                        <span>{profile.followersCount} Followers</span>
                        <span>{profile.followingCount} Following</span>
                    </div>

                    {user?._id !== userId && (
                        <button onClick={handleFollow}>
                            {profile.isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

};

export default Profile;
