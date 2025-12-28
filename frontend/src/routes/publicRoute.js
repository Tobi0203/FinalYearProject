import { UseAuth } from '../context/authContext'
import { Navigate } from 'react-router-dom';

const PublicRoute = ({children}) => {
    const {user,loading}=UseAuth();
    if(loading){
        return <p>public loading.......</p>
    }
    if(user){
        return <Navigate to="/" replace/>
    }
  return children
}

export default PublicRoute
