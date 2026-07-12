import { useSelector } from "react-redux";

export default function RoleGate({ roles, children, fallback = null }) {
  const userRole = useSelector((state) => state.auth.user?.role);

  if (!roles || roles.length === 0) return children;
  return roles.includes(userRole) ? children : fallback;
}

export const useUserRole = () =>
  useSelector((state) => state.auth.user?.role);

export const useCurrentUser = () => useSelector((state) => state.auth.user);