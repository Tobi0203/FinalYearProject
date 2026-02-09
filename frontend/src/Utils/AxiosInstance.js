import axios from "axios"
const axiosIns=axios.create({
    baseURL:"https://final-year-project-ten-mauve.vercel.app/",
    // headers:{
    //     "Content-Type":"application/json"
    // },
    withCredentials:true
});
export default axiosIns