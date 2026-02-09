import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosIns from "../../Utils/AxiosInstance";
import socket from "../../Utils/Socket";
import { useAuth } from "../../Context/AuthContext";
import "./Profile.css"

import ProfileHeader from "../../Components/Profile/ProfileHeader/ProfileHeader";
import ProfilePosts from "../../Components/Profile/ProfilePosts/ProfilePosts";
import FollowRequests from "../../Components/Profile/FollowRequests/FollowRequests";
import ProfileTabs from "../../Components/Profile/ProfileTabs/ProfileTabs";
import BlockedUsers from "../../Components/Profile/BlockedUsers/BlockedUsers";
import FollowersModal from "../../Components/Profile/FollowersModal/FollowersModal";
import EditProfileModal from "../../Components/Profile/UpdateModal/EditProfileModal";

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
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [showBlockModal, setShowBlockModal] = useState(false);


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
        console.log("from handle profile update --profile")
        setProfile(updatedUser);
    };
    const navigate = useNavigate();

    const handleMessage = async (receiverId) => {
        const res = await axiosIns.post("/conversations", {
            receiverId,
        });

        navigate("/messages", {
            state: { conversationId: res.data.conversation._id },
        });
    };



    const { setUser } = useAuth();

    const handleFollow = async (targetUserId = userId) => {
        try {
            const res = await axiosIns.put(`/users/toggleFollow/${targetUserId}`);
            console.log(res.data);
            if (res.data.status === "requested") {
                setUser(prev => ({
                    ...prev,
                    sentRequests: [...(prev.sentRequests || []), targetUserId],
                }));
                setProfile(prev => ({
                    ...prev,
                    isFollowing: false,
                }));
                return;
            }

            if (res.data.follow === true) {
                setUser(prev => ({
                    ...prev,
                    following: [...prev.following, targetUserId],
                }));
            }

            if (res.data.follow === false) {
                setUser(prev => ({
                    ...prev,
                    following: prev.following.filter(id => id !== targetUserId),
                }));

                setProfile(prev => ({
                    ...prev,
                    isFollowing: false,
                    followersCount: Math.max(0, prev.followersCount - 1),
                }));
            }


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

    const handleBlock = async () => {
        try {
            const res = await axiosIns.put(`/users/block/${profile._id}`);

            if (res.data.blocked) {
                setProfile(prev => ({
                    ...prev,
                    isFollowing: false,
                    followersCount: res.data.removedFollower
                        ? Math.max(0, prev.followersCount - 1)
                        : prev.followersCount,
                    followingCount: res.data.removedFollowing
                        ? Math.max(0, prev.followingCount - 1)
                        : prev.followingCount,
                }));
            }

            setIsBlocked(res.data.blocked);
            setShowBlockModal(false);
        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosIns.get(`/users/profile/${userId}`);
                console.log("from frontend --profile", res.data.user)
                if (res.data.success) {
                    setProfile(res.data.user);
                    setPosts(res.data.posts);
                    setIsBlocked(res.data.blocked);
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId, user?._id]);

    useEffect(() => {
        if (!profile?._id || !user?._id) return;

        const handleFollowUpdate = ({ targetUserId, actionUserId, isFollowing }) => {

            // 1️⃣ Someone followed/unfollowed THIS profile
            if (targetUserId === profile._id) {
                // someone followed/unfollowed THIS profile
                setProfile(prev => ({
                    ...prev,
                    followersCount: isFollowing
                        ? prev.followersCount + 1
                        : prev.followersCount - 1,
                }));
            }

            if (actionUserId === profile._id) {
                // THIS profile followed/unfollowed someone
                setProfile(prev => ({
                    ...prev,
                    followingCount: isFollowing
                        ? prev.followingCount + 1
                        : prev.followingCount - 1,
                }));
            }


            // 2️⃣ Logged-in user followed/unfollowed THIS profile
            if (
                actionUserId === user._id &&
                targetUserId === profile._id
            ) {
                // Logged-in user followed/unfollowed THIS profile
                setProfile(prev => ({
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
        if (activeTab !== "blocked") return;

        const fetchBlockedUsers = async () => {
            const res = await axiosIns.get("/users/blocked");
            if (res.data.success) {
                setBlockedUsers(res.data.users);
            }
        };

        fetchBlockedUsers();
    }, [activeTab]);

    useEffect(() => {
        // close followers/following modal when navigating to another profile
        setShowModal(false);
        setListUsers([]);
        setModalType("");
    }, [userId]);

    const acceptRequest = async (requesterId) => {
        try {
            const res = await axiosIns.post(
                `/users/follow/accept/${requesterId}`
            );

            if (res.data.success) {
                // remove request only
                setProfile(prev => ({
                    ...prev,
                    followRequests: prev.followRequests.filter(
                        id => id !== requesterId
                    ),
                }));

                setUser(prev => ({
                    ...prev,
                    followRequests: (prev.followRequests || []).filter(
                        u => (u._id || u) !== requesterId
                    ),
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };


    const declineRequest = async (requesterId) => {
        try {
            const res = await axiosIns.post(
                `/users/follow/decline/${requesterId}`
            );

            if (res.data.success) {
                setUser(prev => ({
                    ...prev,
                    followRequests: (prev.followRequests || []).filter(
                        u => (u._id || u) !== requesterId
                    ),
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };
    const handleUnblockFromList = async (blockedUserId) => {
        await axiosIns.put(`/users/block/${blockedUserId}`);
        setBlockedUsers(prev =>
            prev.filter(u => u._id !== blockedUserId)
        );
    };




    if (loading) return <p>Loading profile...</p>;
    if (!profile) return <p>User not found</p>;
    if (isBlocked) {
        return (
            <div className="profile-page">
                <div className="blocked-profile">
                    <h3>User not available</h3>
                    <p>You blocked this user.</p>

                    <button onClick={() => setShowBlockModal(true)}>
                        Unblock
                    </button>

                    {showBlockModal && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h3>Unblock user?</h3>
                                <p>They will be able to see your profile again.</p>

                                <button className="danger" onClick={handleBlock}>
                                    Unblock
                                </button>
                                <button onClick={() => setShowBlockModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }


    return (
        <div className="profile-page">
            <ProfileHeader
                profile={profile}
                user={user}
                postsCount={posts.length}
                isOwnProfile={user?._id === userId}
                onFollow={handleFollow}
                onAccept={acceptRequest}
                onDecline={declineRequest}
                openModal={openModal}
                onEditProfile={() => setShowEditModal(true)}
                onMessage={handleMessage}
                onBlock={() => setShowBlockModal(true)}
            />
            {showEditModal && (
                <EditProfileModal
                    profile={profile}
                    closeModal={() => setShowEditModal(false)}
                    onUpdate={handleProfileUpdate}
                />
            )}
            {showBlockModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Block user?</h3>
                        <p>
                            They won’t be able to find your profile, posts, or message you.
                        </p>

                        <button className="danger" onClick={handleBlock}>
                            Block
                        </button>

                        <button onClick={() => setShowBlockModal(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}


            {user?._id === userId &&
                user?.isPrivate &&
                user?.followRequests?.length > 0 && (
                    <FollowRequests />
                )}

            <ProfileTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOwnProfile={user?._id === userId}
            />
            {/* 🔒 PRIVATE ACCOUNT POST VISIBILITY */}
            {activeTab === "posts" && (
                (!profile.isPrivate ||
                    profile.isFollowing ||
                    user?._id === userId) ? (
                    <ProfilePosts posts={posts} />
                ) : (
                    <div className="privateAccountMsg">
                        <h3>This account is private</h3>
                        <p>Follow to see their posts.</p>
                    </div>
                )
            )}


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
            {activeTab === "blocked" && (
                <BlockedUsers
                    users={blockedUsers}
                    onUnblock={handleUnblockFromList}
                />
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
