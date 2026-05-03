import { Route } from 'react-router-dom';

import Cartelera from './pages/Cartelera';
import DetalleTorneo from './pages/DetalleTorneo';
import CrearTorneo from './pages/CrearTorneo';
import EditarTorneo from './pages/EditarTorneo';
import GestionTorneo from './pages/GestionTorneo';
import ProtectedRoute from '@/routes/ProtectedRoute';

export const torneosRoutes = (
  <>
    <Route path="/torneos" element={<Cartelera />} />
    <Route path="/torneos/:id" element={<DetalleTorneo />} />
    <Route path="/organizador/torneos/nuevo" element={<ProtectedRoute requireRol="organizador"><CrearTorneo /></ProtectedRoute>} />
    <Route path="/organizador/torneos/:id/editar" element={<ProtectedRoute requireRol="organizador"><EditarTorneo /></ProtectedRoute>} />
    <Route path="/organizador/torneos/:id/gestion" element={<ProtectedRoute requireRol="organizador"><GestionTorneo /></ProtectedRoute>} />
  </>
);
