import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  let isValid = true;

  if (!token) {
    isValid = false;
  } else {
    try {
      const decoded = jwtDecode(token);

      const now = new Date().getTime();
      const isExpired = decoded.exp * 1000 < now;

      if (isExpired) {
        isValid = false;
      }

    } catch {
      isValid = false;
    }
  }

  if (!isValid) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;