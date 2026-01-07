import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosIns from "../../utils/axiosInstance";
import socket from "../../utils/socket";
import { useAuth } from "../../context/authContext";
import "./profile.css"

import ProfileHeader from "../../Components/profile/profileHeader/profileHeader";
import ProfilePosts from "../../Components/profile/profilePosts/profilePosts";
import ProfileTabs from "../../Components/profile/profileTabs/profileTabs";
import FollowersModal from "../../Components/profile/followersModal/followersModal";
import EditProfileModal from "../../Components/profile/updateModal/editProfileModal";

const Profile = () => {
    const { userId } = useParams();
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([])
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(""); // followers | following
    const [listUsers, setListUsers] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);

    const openModal = async (type) => {
        setModalType(type);
        setShowModal(true);
        try {
            const res = await axiosIns.get(`/users/${type}/${userId}`);
            console.log(res.data)
            if (res.data.success) {
                setListUsers(res.data.users);
            }
        } catch (err) {
            console.error(err);
        }
    };
    const closeModal = () => {
        setShowModal(false);
        setListUsers([]);
    };

    const handleProfileUpdate = (updatedUser) => {
        setProfile(updatedUser);
    };



    const handleFollow = async (targetUserId = userId) => {
        try {
            await axiosIns.put(`/users/toggleFollow/${targetUserId}`);
            // if (res.data.success) {

            //     // 👉 If action is for profile header
            //     if (targetUserId === userId) {
            //         setProfile((prev) => ({
            //             ...prev,
            //             isFollowing: !prev.isFollowing,
            //             followersCount: prev.isFollowing
            //                 ? prev.followersCount - 1
            //                 : prev.followersCount + 1,
            //         }));
            //     }

            //     // 👉 If action is from modal (unfollow)
            //     else {
            //         setListUsers((prev) =>
            //             prev.filter((u) => u._id !== targetUserId)
            //         );

            //         setProfile((prev) => ({
            //             ...prev,
            //             followingCount: prev.followingCount - 1,
            //         }));
            //     }
            // }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveFollower = (followerId) => {
        setListUsers((prev) => prev.filter((u) => u._id !== followerId));

        setProfile((prev) => ({
            ...prev,
            followersCount: prev.followersCount - 1,
        }));
    };

    const handleUnsaveFromProfile = async (postId) => {
        // try {
        // const res=await axiosIns.put(`/posts/toggleSave/:${postId}`)
        // console.log(res.data)
        // if(res.data.success){
        setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
        //     }
        // } catch (error) {
        //     console.log(error.message)
        // }
    };
    const handleUnlikeFromProfile = (postId) => {
        setLikedPosts((prev) => prev.filter((p) => p._id !== postId));
    };



    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosIns.get(`/users/profile/${userId}`);
                if (res.data.success) {
                    setProfile(res.data.user);
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
        if (!profile?._id || !user?._id) return;

        const handleFollowUpdate = ({
            targetUserId,
            actionUserId,
            isFollowing,
        }) => {
            // Someone followed/unfollowed THIS profile
            if (targetUserId === profile._id) {
                setProfile((prev) => ({
                    ...prev,
                    followersCount: isFollowing
                        ? prev.followersCount + 1
                        : prev.followersCount - 1,
                }));
            }

            // Logged-in user followed/unfollowed THIS profile
            if (
                actionUserId === user._id &&
                targetUserId === profile._id
            ) {
                setProfile((prev) => ({
                    ...prev,
                    isFollowing,
                }));
            }
        };

        socket.on("followUpdate", handleFollowUpdate);
        return () => socket.off("followUpdate", handleFollowUpdate);
    }, [profile?._id, user?._id]);

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                console.log(userId)
                const res = await axiosIns.get(`/posts/userPosts/${userId}`);
                //   console.log(res.data)
                if (res.data.success) {
                    setPosts(res.data.posts);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchUserPosts();
    }, [userId]);
    useEffect(() => {
        if (activeTab !== "saved") return;

        const fetchSavedPosts = async () => {
            try {
                const res = await axiosIns.get("/posts/savedPosts");
                if (res.data.success) {
                    setSavedPosts(res.data.posts);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchSavedPosts();
    }, [activeTab]);
    useEffect(() => {
        if (activeTab !== "liked") return;

        const fetchSavedPosts = async () => {
            try {
                const res = await axiosIns.get("/posts/likedPosts");
                if (res.data.success) {
                    setLikedPosts(res.data.posts);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchSavedPosts();
    }, [activeTab,]);
    useEffect(() => {
        // close followers/following modal when navigating to another profile
        setShowModal(false);
        setListUsers([]);
        setModalType("");
    }, [userId]);



    if (loading) return <p>Loading profile...</p>;
    if (!profile) return <p>User not found</p>;

    return (
        <div className="profile-page">
            <ProfileHeader
                profile={profile}
                postsCount={posts.length}
                isOwnProfile={user?._id === userId}
                onFollow={handleFollow}
                openModal={openModal}
                onEditProfile={() => setShowEditModal(true)}
            />
            {showEditModal && (
                <EditProfileModal
                    profile={profile}
                    closeModal={() => setShowEditModal(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}


            <ProfileTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOwnProfile={user?._id === userId}
            />
            {activeTab === "posts" && <ProfilePosts posts={posts} />}

            {activeTab === "saved" && (
                <ProfilePosts
                    posts={savedPosts}
                    onUnsave={handleUnsaveFromProfile}
                    isSavedTab
                />
            )}

            {activeTab === "liked" && (
                <ProfilePosts
                    posts={likedPosts}
                    onUnLike={handleUnlikeFromProfile}
                    isLikedTab />
            )}

            {showModal && (
                <FollowersModal
                    type={modalType}
                    users={listUsers}
                    closeModal={closeModal}
                    isOwnProfile={user?._id === userId}
                    onRemove={handleRemoveFollower}
                    onUnFollow={handleFollow}
                />
            )}

        </div>
    );
};

export default Profile;
