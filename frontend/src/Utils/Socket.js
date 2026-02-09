import { io } from "socket.io-client";
const socket=io("https://social-media-backend-bd38.onrender.com",{
    withCredentials:true,
});
export default socket;