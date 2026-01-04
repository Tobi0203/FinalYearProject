import { useAuth } from '../context/authContext'
import { Navigate } from 'react-router-dom';

const PublicRoute = ({children}) => {
    const {user,loading}=useAuth();
    if(loading){
        return <p>public loading.......</p>
    }
    if(user){
        return <Navigate to="/home" replace/>
    }
  return children
}

export default PublicRoute
