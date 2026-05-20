import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, EmptyState, Skeleton } from '@/components/ui';
import EstadisticasJugador from '@/components/domain/EstadisticasJugador';
import MisEstadisticasTab from '@/modules/identidad/components/MisEstadisticasTab';
import MisInscripcionesTab from '../components/MisInscripcionesTab';
import { useAuth } from '@/hooks/useAuth';
import { apiGet } from '@/services/api';
import ProfileHeader from '../components/ProfileHeader';

export default function PerfilJugador({ perfil }) {
  const { user } = useAuth();
  const esDueno = user && user.id === perfil.id;
  const [mazos, setMazos] = useState([]);
  const [cargandoMazos, setCargandoMazos] = useState(true);

  useEffect(() => {
    apiGet(`/jugadores/${perfil.id}/mazos`)
      .then((data) => setMazos(Array.isArray(data) ? data : []))
      .catch(() => setMazos([]))
      .finally(() => setCargandoMazos(false));
  }, [perfil.id]);

  return (
    <div className="profile-page">
      <ProfileHeader nombre={perfil.nombre_usuario} rol={perfil.rol} />

      <div className="profile-body">
        <EstadisticasJugador usuarioId={perfil.id} variante="compacto" />

        <section className="profile-section">
          <h3 className="profile-section__title">Mazos públicos</h3>
          {cargandoMazos ? (
            <Skeleton height={80} />
          ) : mazos.length === 0 ? (
            <EmptyState
              title="Sin mazos públicos"
              description={esDueno ? 'Aún no has creado ningún mazo.' : 'Este jugador todavía no publicó mazos.'}
            />
          ) : (
            <ul className="profile-mazos-lista">
              {mazos.map((mazo) => (
                <li key={mazo.id} className="profile-mazos-lista__item">
                  <Link to={`/mazos/${mazo.id}`} className="profile-mazos-lista__link">
                    <span className="profile-mazos-lista__nombre">{mazo.nombre}</span>
                    <span className="profile-mazos-lista__formato">{mazo.formato}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {esDueno && (
          <section className="profile-section">
            <Tabs>
              <Tabs.Tab eventKey="inscripciones" label="Mis inscripciones">
                <MisInscripcionesTab />
              </Tabs.Tab>
              <Tabs.Tab eventKey="estadisticas" label="Mis estadísticas">
                <MisEstadisticasTab usuarioId={perfil.id} />
              </Tabs.Tab>
            </Tabs>
          </section>
        )}
      </div>
    </div>
  );
}
