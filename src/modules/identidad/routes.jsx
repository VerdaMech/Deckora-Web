import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';

import Spinner from '@/components/ui/Spinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ErrorChunk from '@/components/ui/ErrorChunk';
import ProtectedRoute from '@/routes/ProtectedRoute';

const Login = lazy(() => import('./pages/Login'));
const Registro = lazy(() => import('./pages/Registro'));
const RecuperarPassword = lazy(() => import('./pages/RecuperarPassword'));
const PerfilRouter = lazy(() => import('./pages/PerfilRouter'));
const Configuracion = lazy(() => import('./pages/Configuracion'));

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

export const identidadRoutes = (
  <>
    <Route path="/login" element={<ConSuspense><Login /></ConSuspense>} />
    <Route path="/registro" element={<ConSuspense><Registro /></ConSuspense>} />
    <Route path="/recuperar" element={<ConSuspense><RecuperarPassword /></ConSuspense>} />
    <Route path="/u/:username" element={<ConSuspense><PerfilRouter /></ConSuspense>} />
    <Route
      path="/configuracion"
      element={
        <ProtectedRoute requireRol="any">
          <ConSuspense><Configuracion /></ConSuspense>
        </ProtectedRoute>
      }
    />
  </>
);
