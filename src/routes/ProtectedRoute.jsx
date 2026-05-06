import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';

/**
 * @param {{ requireRol?: string, children: React.ReactNode }} props
 * requireRol = 'any' — solo requiere auth. requireRol = 'jugador' — requiere ese rol exacto.
 */
export default function ProtectedRoute({ requireRol, children }) {
  const { user, rol, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireRol && requireRol !== 'any') {
    const rolesPermitidos = Array.isArray(requireRol) ? requireRol : [requireRol];
    if (!rolesPermitidos.includes(rol)) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return children;
}
