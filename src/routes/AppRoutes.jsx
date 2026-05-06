import { Routes, Route } from 'react-router-dom';

import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';

// Páginas globales
import NotFound from '@/pages/NotFound';
import Forbidden from '@/pages/Forbidden';

// Módulo: identidad
import Login from '@/modules/identidad/pages/Login';
import Registro from '@/modules/identidad/pages/Registro';
import RecuperarPassword from '@/modules/identidad/pages/RecuperarPassword';
import PerfilRouter from '@/modules/identidad/pages/PerfilRouter';
import Configuracion from '@/modules/identidad/pages/Configuracion';

// Módulo: mazos
import MisColecciones from '@/modules/mazos/pages/MisColecciones';
import DetalleColeccion from '@/modules/mazos/pages/DetalleColeccion';
import MisMazos from '@/modules/mazos/pages/MisMazos';
import CrearMazoModal from '@/modules/mazos/pages/CrearMazoModal';
import DetalleMazo from '@/modules/mazos/pages/DetalleMazo';

// Demo de desarrollo
import DemoMapa from '@/pages/DemoMapa';

// Módulo: torneos
import Cartelera from '@/modules/torneos/pages/Cartelera';
import DetalleTorneo from '@/modules/torneos/pages/DetalleTorneo';
import CrearTorneo from '@/modules/torneos/pages/CrearTorneo';
import EditarTorneo from '@/modules/torneos/pages/EditarTorneo';
import GestionTorneo from '@/modules/torneos/pages/GestionTorneo';

// Módulo: dashboards
import Landing from '@/modules/dashboards/pages/Landing';
import DashboardJugador from '@/modules/dashboards/pages/DashboardJugador';
import DashboardOrganizador from '@/modules/dashboards/pages/DashboardOrganizador';
import DashboardTienda from '@/modules/dashboards/pages/DashboardTienda';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Rutas con sidebar (pantallas operativas autenticadas) ── */}
      <Route element={<AppLayout withSidebar />}>
        <Route path="/jugador" element={<ProtectedRoute requireRol="jugador"><DashboardJugador /></ProtectedRoute>} />
        <Route path="/organizador" element={<ProtectedRoute requireRol="organizador"><DashboardOrganizador /></ProtectedRoute>} />
        <Route path="/tienda" element={<ProtectedRoute requireRol="tienda"><DashboardTienda /></ProtectedRoute>} />
        <Route path="/configuracion" element={<ProtectedRoute requireRol="any"><Configuracion /></ProtectedRoute>} />
        <Route path="/organizador/torneos/:id/gestion" element={<ProtectedRoute requireRol="organizador"><GestionTorneo /></ProtectedRoute>} />
      </Route>

      {/* ── Rutas sin sidebar (públicas + operativas livianas) ── */}
      <Route element={<AppLayout />}>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Identidad */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />
        <Route path="/u/:username" element={<PerfilRouter />} />

        {/* Mazos y colecciones */}
        <Route path="/colecciones" element={<ProtectedRoute requireRol="jugador"><MisColecciones /></ProtectedRoute>} />
        <Route path="/colecciones/:id" element={<ProtectedRoute requireRol="jugador"><DetalleColeccion /></ProtectedRoute>} />
        <Route path="/mazos" element={<ProtectedRoute requireRol="jugador"><MisMazos /></ProtectedRoute>} />
        <Route path="/mazos/nuevo" element={<ProtectedRoute requireRol="jugador"><CrearMazoModal /></ProtectedRoute>} />
        <Route path="/mazos/:id" element={<ProtectedRoute requireRol="jugador"><DetalleMazo /></ProtectedRoute>} />

        {/* Torneos */}
        <Route path="/torneos" element={<Cartelera />} />
        <Route path="/torneos/:id" element={<DetalleTorneo />} />
        <Route path="/organizador/torneos/nuevo" element={<ProtectedRoute requireRol="organizador"><CrearTorneo /></ProtectedRoute>} />
        <Route path="/organizador/torneos/:id/editar" element={<ProtectedRoute requireRol="organizador"><EditarTorneo /></ProtectedRoute>} />

        {/* Demo (solo desarrollo) */}
        {import.meta.env.DEV && <Route path="/demo/mapa" element={<DemoMapa />} />}

        {/* Globales */}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
