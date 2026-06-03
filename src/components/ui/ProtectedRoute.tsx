import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, utilisateur } = useAuthStore();

  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  if (roles && utilisateur && !roles.includes(utilisateur.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
