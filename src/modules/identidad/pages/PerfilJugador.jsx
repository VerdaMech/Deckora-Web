import { useState, useEffect } from 'react';
import { EmptyState, Spinner, Tabs } from '@/components/ui';
import EstadisticasJugador from '@/components/domain/EstadisticasJugador';
import RoleBadge from '@/components/domain/RoleBadge';
import MisEstadisticasTab from '@/modules/identidad/components/MisEstadisticasTab';
import MisInscripcionesTab from '../components/MisInscripcionesTab';
import { useAuth } from '@/hooks/useAuth';
import { obtenerMiColeccion } from '@/services/colecciones.service';

function getInitials(nombre) {
  return (nombre ?? '?').substring(0, 2).toUpperCase();
}

export default function PerfilJugador({ perfil }) {
  const { user } = useAuth();
  const esDueno = user && user.id === perfil.id;

  const [coleccion, setColeccion] = useState(null);
  const [cargandoColeccion, setCargandoColeccion] = useState(false);

  useEffect(() => {
    if (!esDueno) return;
    setCargandoColeccion(true);
    obtenerMiColeccion()
      .then(setColeccion)
      .catch(() => setColeccion({ cartas: [] }))
      .finally(() => setCargandoColeccion(false));
  }, [esDueno]);

  const cartasColeccion = coleccion?.ColeccionCartas ?? coleccion?.cartas ?? [];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header__avatar">{getInitials(perfil.nombre_usuario)}</div>
        <div className="profile-header__info">
          <h1 className="profile-header__name">{perfil.nombre_usuario}</h1>
          <div className="profile-header__role">
            <RoleBadge rol={perfil.rol} />
          </div>
        </div>
      </div>

      <div className="profile-body">
        <EstadisticasJugador usuarioId={perfil.id} variante="compacto" />

        <section className="profile-section">
          <h3 className="profile-section__title">Mazos públicos</h3>
          <EmptyState
            title="Sin mazos públicos"
            description={esDueno ? 'Aún no has creado ningún mazo.' : 'Este jugador todavía no publicó mazos.'}
          />
        </section>

        {esDueno && (
          <section className="profile-section">
            <h3 className="profile-section__title">Mi colección</h3>
            {cargandoColeccion ? (
              <Spinner />
            ) : cartasColeccion.length === 0 ? (
              <EmptyState
                title="Colección vacía"
                description="Aún no has agregado cartas a tu colección."
              />
            ) : (
              <ul className="collection-list">
                {cartasColeccion.map((entrada) => (
                  <li key={entrada.id ?? entrada.carta_id} className="collection-list__item">
                    <span className="collection-list__nombre">{entrada.Carta?.nombre ?? '—'}</span>
                    <span className="collection-list__cantidad">x{entrada.cantidad}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

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
