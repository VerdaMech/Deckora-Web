import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';

import Spinner from '@/components/ui/Spinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ErrorChunk from '@/components/ui/ErrorChunk';

const Biblioteca = lazy(() => import('./pages/Biblioteca'));

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

export const bibliotecaRoutes = (
  <Route path="/biblioteca" element={<ConSuspense><Biblioteca /></ConSuspense>} />
);
