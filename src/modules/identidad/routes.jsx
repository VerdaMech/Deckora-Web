import { Route } from 'react-router-dom';

import Login from './pages/Login';
import Registro from './pages/Registro';
import RecuperarPassword from './pages/RecuperarPassword';
import PerfilRouter from './pages/PerfilRouter';
import Configuracion from './pages/Configuracion';
import ProtectedRoute from '@/routes/ProtectedRoute';

export const identidadRoutes = (
  <>
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Registro />} />
    <Route path="/recuperar" element={<RecuperarPassword />} />
    <Route path="/u/:username" element={<PerfilRouter />} />
    <Route path="/configuracion" element={<ProtectedRoute requireRol="any"><Configuracion /></ProtectedRoute>} />
  </>
);
