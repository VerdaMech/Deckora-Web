import { Route } from 'react-router-dom';

import Landing from './pages/Landing';
import DashboardJugador from './pages/DashboardJugador';
import DashboardOrganizador from './pages/DashboardOrganizador';
import DashboardTienda from './pages/DashboardTienda';
import ProtectedRoute from '@/routes/ProtectedRoute';

export const dashboardsRoutes = (
  <>
    <Route path="/" element={<Landing />} />
    <Route path="/jugador" element={<ProtectedRoute requireRol="jugador"><DashboardJugador /></ProtectedRoute>} />
    <Route path="/organizador" element={<ProtectedRoute requireRol="organizador"><DashboardOrganizador /></ProtectedRoute>} />
    <Route path="/tienda" element={<ProtectedRoute requireRol="tienda"><DashboardTienda /></ProtectedRoute>} />
  </>
);
