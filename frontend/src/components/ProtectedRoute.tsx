import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "membre";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Vérification du rôle si spécifié
  if (requiredRole && user?.role !== requiredRole) {
    // Rediriger vers le dashboard approprié
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/member/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
