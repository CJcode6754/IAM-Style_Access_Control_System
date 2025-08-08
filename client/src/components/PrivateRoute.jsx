import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(selectAuth);
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
