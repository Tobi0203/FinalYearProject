import { useAuth } from '../Context/AuthContext'
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return <p>loading.......</p>
    }
    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }
    return children
}

export default PrivateRoute
