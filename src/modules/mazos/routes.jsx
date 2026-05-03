import { Route } from 'react-router-dom';

import MisColecciones from './pages/MisColecciones';
import DetalleColeccion from './pages/DetalleColeccion';
import MisMazos from './pages/MisMazos';
import CrearMazoModal from './pages/CrearMazoModal';
import DetalleMazo from './pages/DetalleMazo';
import ProtectedRoute from '@/routes/ProtectedRoute';

export const mazosRoutes = (
  <>
    <Route path="/colecciones" element={<ProtectedRoute requireRol="jugador"><MisColecciones /></ProtectedRoute>} />
    <Route path="/colecciones/:id" element={<ProtectedRoute requireRol="jugador"><DetalleColeccion /></ProtectedRoute>} />
    <Route path="/mazos" element={<ProtectedRoute requireRol="jugador"><MisMazos /></ProtectedRoute>} />
    <Route path="/mazos/nuevo" element={<ProtectedRoute requireRol="jugador"><CrearMazoModal /></ProtectedRoute>} />
    <Route path="/mazos/:id" element={<ProtectedRoute requireRol="jugador"><DetalleMazo /></ProtectedRoute>} />
  </>
);
