import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ErrorChunk from '@/components/ui/ErrorChunk';
import Spinner from '@/components/ui/Spinner';

// Páginas globales (siempre en el bundle principal)
import NotFound from '@/pages/NotFound';
import Forbidden from '@/pages/Forbidden';

// Landing: sin lazy — es la primera página visible
import Landing from '@/modules/dashboards/pages/Landing';

// Módulo: identidad
const Login = lazy(() => import('@/modules/identidad/pages/Login'));
const Registro = lazy(() => import('@/modules/identidad/pages/Registro'));
const RecuperarPassword = lazy(() => import('@/modules/identidad/pages/RecuperarPassword'));
const PerfilRouter = lazy(() => import('@/modules/identidad/pages/PerfilRouter'));
const Configuracion = lazy(() => import('@/modules/identidad/pages/Configuracion'));

// Módulo: mazos
const MisColecciones = lazy(() => import('@/modules/mazos/pages/MisColecciones'));
const DetalleColeccion = lazy(() => import('@/modules/mazos/pages/DetalleColeccion'));
const MisMazos = lazy(() => import('@/modules/mazos/pages/MisMazos'));
const CrearMazoModal = lazy(() => import('@/modules/mazos/pages/CrearMazoModal'));
const DetalleMazo = lazy(() => import('@/modules/mazos/pages/DetalleMazo'));

// Módulo: torneos
const Cartelera = lazy(() => import('@/modules/torneos/pages/Cartelera'));
const DetalleTorneo = lazy(() => import('@/modules/torneos/pages/DetalleTorneo'));
const MisTorneos = lazy(() => import('@/modules/torneos/pages/MisTorneos'));
const CrearTorneo = lazy(() => import('@/modules/torneos/pages/CrearTorneo'));
const EditarTorneo = lazy(() => import('@/modules/torneos/pages/EditarTorneo'));
const GestionTorneo = lazy(() => import('@/modules/torneos/pages/GestionTorneo'));

// Módulo: dashboards
const DashboardJugador = lazy(() => import('@/modules/dashboards/pages/DashboardJugador'));
const DashboardOrganizador = lazy(() => import('@/modules/dashboards/pages/DashboardOrganizador'));
const DashboardTienda = lazy(() => import('@/modules/dashboards/pages/DashboardTienda'));

function Cargando() {
  return (
    <div className="modulo-cargando" role="status" aria-label="Cargando">
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

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Rutas con sidebar (pantallas operativas autenticadas) ── */}
      <Route element={<AppLayout withSidebar />}>
        <Route path="/jugador" element={<ProtectedRoute requireRol="jugador"><ConSuspense><DashboardJugador /></ConSuspense></ProtectedRoute>} />
        <Route path="/organizador" element={<ProtectedRoute requireRol="organizador"><ConSuspense><DashboardOrganizador /></ConSuspense></ProtectedRoute>} />
        <Route path="/tienda" element={<ProtectedRoute requireRol="tienda"><ConSuspense><DashboardTienda /></ConSuspense></ProtectedRoute>} />
        <Route path="/configuracion" element={<ProtectedRoute requireRol="any"><ConSuspense><Configuracion /></ConSuspense></ProtectedRoute>} />
        <Route path="/colecciones" element={<ProtectedRoute requireRol="jugador"><ConSuspense><MisColecciones /></ConSuspense></ProtectedRoute>} />
        <Route path="/colecciones/:id" element={<ProtectedRoute requireRol="jugador"><ConSuspense><DetalleColeccion /></ConSuspense></ProtectedRoute>} />
        <Route path="/mazos" element={<ProtectedRoute requireRol="jugador"><ConSuspense><MisMazos /></ConSuspense></ProtectedRoute>} />
        <Route path="/mazos/nuevo" element={<ProtectedRoute requireRol="jugador"><ConSuspense><CrearMazoModal /></ConSuspense></ProtectedRoute>} />
        <Route path="/mazos/:id" element={<ProtectedRoute requireRol="jugador"><ConSuspense><DetalleMazo /></ConSuspense></ProtectedRoute>} />
        {/* Torneos */}
        <Route path="/torneos" element={<ConSuspense><Cartelera /></ConSuspense>} />
        <Route path="/torneos/:id" element={<ConSuspense><DetalleTorneo /></ConSuspense>} />
        <Route path="/mis-torneos" element={<ProtectedRoute requireRol={['organizador', 'tienda']}><ConSuspense><MisTorneos /></ConSuspense></ProtectedRoute>} />
        <Route path="/organizador/torneos/:id/gestion" element={<ProtectedRoute requireRol={['organizador', 'tienda']}><ConSuspense><GestionTorneo /></ConSuspense></ProtectedRoute>} />
      </Route>

      {/* ── Rutas sin sidebar (públicas + operativas livianas) ── */}
      <Route element={<AppLayout />}>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Identidad */}
        <Route path="/login" element={<ConSuspense><Login /></ConSuspense>} />
        <Route path="/registro" element={<ConSuspense><Registro /></ConSuspense>} />
        <Route path="/recuperar" element={<ConSuspense><RecuperarPassword /></ConSuspense>} />
        <Route path="/u/:username" element={<ConSuspense><PerfilRouter /></ConSuspense>} />

        <Route path="/organizador/torneos/nuevo" element={<ProtectedRoute requireRol={['organizador', 'tienda']}><ConSuspense><CrearTorneo /></ConSuspense></ProtectedRoute>} />
        <Route path="/organizador/torneos/:id/editar" element={<ProtectedRoute requireRol={['organizador', 'tienda']}><ConSuspense><EditarTorneo /></ConSuspense></ProtectedRoute>} />

        {/* Globales */}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
