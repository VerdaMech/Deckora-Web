import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Spinner from '@/components/ui/Spinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ErrorChunk from '@/components/ui/ErrorChunk';
import ProtectedRoute from '@/routes/ProtectedRoute';

const DashboardJugador = lazy(() => import('./pages/DashboardJugador'));
const DashboardOrganizador = lazy(() => import('./pages/DashboardOrganizador'));
const DashboardTienda = lazy(() => import('./pages/DashboardTienda'));

function Cargando() {
  return (
    <div className="modulo-cargando" role="status" aria-label="Cargando módulo">
      <Spinner size="lg" />
    </div>
  );
}

function ConSuspense({ children }) {
  return (
    <ErrorBoundary fallback={<ErrorChunk />}>
      <Suspense fallback={<Cargando />}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export const dashboardsRoutes = (
  <>
    <Route path="/" element={<Landing />} />
    <Route
      path="/jugador"
      element={
        <ProtectedRoute requireRol="jugador">
          <ConSuspense><DashboardJugador /></ConSuspense>
        </ProtectedRoute>
      }
    />
    <Route
      path="/organizador"
      element={
        <ProtectedRoute requireRol="organizador">
          <ConSuspense><DashboardOrganizador /></ConSuspense>
        </ProtectedRoute>
      }
    />
    <Route
      path="/tienda"
      element={
        <ProtectedRoute requireRol="tienda">
          <ConSuspense><DashboardTienda /></ConSuspense>
        </ProtectedRoute>
      }
    />
  </>
);
