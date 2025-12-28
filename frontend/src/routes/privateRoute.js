import { UseAuth } from '../context/authContext'
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({children}) => {
    const {user,loading}=UseAuth();
    if(loading){
        return <p>loading.......</p>
    }
    if(!user){
        return <Navigate to="/auth/login" replace/>
    }
  return children
}

export default PrivateRoute
