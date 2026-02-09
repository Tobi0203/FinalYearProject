import axios from "axios"
const axiosIns=axios.create({
    baseURL:"https://social-media-backend-bd38.onrender.com",
    // headers:{
    //     "Content-Type":"application/json"
    // },
    withCredentials:true
});
export default axiosIns