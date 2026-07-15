import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore, type AuthUser } from "../store/auth";
import { getDashboardRoute } from "../utils/getDashboardRoute";
import { ROUTES } from "../config/routes";

interface RoleRouteProps {
  allowedRoles: Array<AuthUser['role']>;
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuthStore();
  
  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect unauthorized authenticated users to their respective default dashboards
    const defaultPath = user ? getDashboardRoute(user.role) : ROUTES.PUBLIC.LOGIN;
    return <Navigate to={defaultPath} replace />;
  }

  return <Outlet />;
}
