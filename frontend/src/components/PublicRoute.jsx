import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router';

export const PublicRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};