import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Spinner } from '@/components/ui';
import { obtenerPerfilPublico } from '@/services/usuarios.service';
import NotFound from '@/pages/NotFound';
import PerfilJugador from './PerfilJugador';
import PerfilOrganizador from './PerfilOrganizador';
import PerfilTienda from './PerfilTienda';

export default function PerfilRouter() {
  const { username } = useParams();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerPerfilPublico(username)
      .then(setPerfil)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="profile-loading">
        <Spinner size="lg" />
      </div>
    );
  }
  if (error || !perfil) return <NotFound />;

  if (perfil.rol === 'jugador') return <PerfilJugador perfil={perfil} />;
  if (perfil.rol === 'organizador') return <PerfilOrganizador perfil={perfil} />;
  if (perfil.rol === 'tienda') return <PerfilTienda perfil={perfil} />;
  return <NotFound />;
}
