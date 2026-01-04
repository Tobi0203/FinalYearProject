import React, { useEffect, useContext, createContext, useState } from 'react'
import axiosIns from '../utils/axiosInstance';
import socket from '../utils/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrenUser = async () => {
        try {
            const res = await axiosIns.get("users/current");
            if (res.data.success) {
                setUser(res.data.user);
            }
            else {
                setUser(null);
            }

        } catch (error) {
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchCurrenUser();
    }, []);

    useEffect(() => {
        if (user?._id) {
            socket.emit("addUser", user._id);
            console.log("Socket addUser emitted:", user._id);
        }
    }, [user]);
    useEffect(() => {
        socket.on("connect", () => {
            if (user?._id) {
                socket.emit("addUser", user._id);
            }
        });

        return () => socket.off("connect");
    }, [user]);



    const logout = async () => {
        await axiosIns.post("/auth/logout");
        setUser(null);
    }
    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);
