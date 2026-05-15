import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';

import Spinner from '@/components/ui/Spinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ErrorChunk from '@/components/ui/ErrorChunk';
import ProtectedRoute from '@/routes/ProtectedRoute';

const MisMazos = lazy(() => import('./pages/MisMazos'));
const DetalleMazo = lazy(() => import('./pages/DetalleMazo'));

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

export const mazosRoutes = (
  <>
    <Route
      path="/mazos"
      element={
        <ProtectedRoute requireRol="jugador">
          <ConSuspense><MisMazos /></ConSuspense>
        </ProtectedRoute>
      }
    />
    <Route
      path="/mazos/:id"
      element={
        <ProtectedRoute requireRol="jugador">
          <ConSuspense><DetalleMazo /></ConSuspense>
        </ProtectedRoute>
      }
    />
  </>
);
