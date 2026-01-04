import { useAuth } from '../context/authContext'
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {
    const {user,loading}=useAuth();
    const navigate=useNavigate();
    if(loading){
        return <p>loading.......</p>
    }
    if(!user){
        return navigate("/auth/login")
    }
  return children
}

export default PrivateRoute
