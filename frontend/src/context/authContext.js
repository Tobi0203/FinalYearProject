import React,{useEffect,useContext,createContext, useState} from 'react'
import axiosIns from '../utils/axiosInstance';

const authContext=createContext();

export const AuthProvider = ({children}) => {
    const [user,setUser]=useState(null);
    const [loading,setLoading]=useState(true);

    const fetchCurrenUser=async()=>{
        try {
           const res=await axiosIns.get("users/current");
           if(res.data.success){
            setUser(res.data.user);
           } 
           else{
            setUser(null);
           }

        } catch (error) {
            setUser(null);
        }
        finally{
            setLoading(false);
        }
    }
    useEffect(()=>{
        fetchCurrenUser();
    },[]);

    const logout=async ()=>{
        await axiosIns.post("/auth/logout");
        setUser(null);
    }
  return (
    <authContext.Provider value={{user,setUser,loading,logout}}>
        {children}
    </authContext.Provider>
  )
}

export const UseAuth=()=>useContext(authContext);
