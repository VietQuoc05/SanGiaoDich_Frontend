import { Navigate, useLocation } from "react-router-dom";
import { getRedirectPathForRole, getStoredRole, normalizeRole } from "../utils/auth";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const role = getStoredRole(token);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  if (normalizedAllowedRoles.length > 0 && !role) {
    if (normalizedAllowedRoles.includes("ROLE_USER")) {
      return children;
    }

    return <Navigate to="/home" replace />;
  }

  if (normalizedAllowedRoles.length > 0 && role && !normalizedAllowedRoles.includes(role)) {
    const fallbackPath = getRedirectPathForRole(role) || "/";

    if (fallbackPath === location.pathname) {
      return <Navigate to="/" replace />;
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export default ProtectedRoute;