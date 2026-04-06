import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminProtectedRoute({ children }) {
  const { token, user, loading } = useAuth();

  if (loading) return null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
