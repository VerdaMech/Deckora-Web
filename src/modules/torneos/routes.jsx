import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';

import Spinner from '@/components/ui/Spinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ErrorChunk from '@/components/ui/ErrorChunk';
import ProtectedRoute from '@/routes/ProtectedRoute';

const Cartelera = lazy(() => import('./pages/Cartelera'));
const DetalleTorneo = lazy(() => import('./pages/DetalleTorneo'));
const CrearTorneo = lazy(() => import('./pages/CrearTorneo'));
const EditarTorneo = lazy(() => import('./pages/EditarTorneo'));
const GestionTorneo = lazy(() => import('./pages/GestionTorneo'));

const ROLES_ORG = ['organizador', 'tienda'];

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

export const torneosRoutes = (
  <>
    <Route path="/torneos" element={<ConSuspense><Cartelera /></ConSuspense>} />
    <Route path="/torneos/:id" element={<ConSuspense><DetalleTorneo /></ConSuspense>} />
    <Route
      path="/organizador/torneos/nuevo"
      element={
        <ProtectedRoute requireRol={ROLES_ORG}>
          <ConSuspense><CrearTorneo /></ConSuspense>
        </ProtectedRoute>
      }
    />
    <Route
      path="/organizador/torneos/:id/editar"
      element={
        <ProtectedRoute requireRol={ROLES_ORG}>
          <ConSuspense><EditarTorneo /></ConSuspense>
        </ProtectedRoute>
      }
    />
    <Route
      path="/organizador/torneos/:id/gestion"
      element={
        <ProtectedRoute requireRol={ROLES_ORG}>
          <ConSuspense><GestionTorneo /></ConSuspense>
        </ProtectedRoute>
      }
    />
  </>
);
