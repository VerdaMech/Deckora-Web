import { Card, EmptyState, Tabs } from '@/components/ui';
import EstadisticasJugador from '@/components/domain/EstadisticasJugador';
import RoleBadge from '@/components/domain/RoleBadge';
import MisEstadisticasTab from '@/modules/identidad/components/MisEstadisticasTab';
import MisInscripcionesTab from '../components/MisInscripcionesTab';
import { useAuth } from '@/hooks/useAuth';

const MAZOS_PUBLICOS_MOCK = [
  { id: 1, nombre: 'Atraxa Command', formato: 'COMMANDER', comandante: "Atraxa, Praetor's Voice" },
  { id: 2, nombre: 'Yuriko Ninjas', formato: 'COMMANDER', comandante: "Yuriko, the Tiger's Shadow" },
];

function getInitials(nombre) {
  return (nombre ?? '?').substring(0, 2).toUpperCase();
}

export default function PerfilJugador({ perfil }) {
  const { user } = useAuth();
  const esDueno = user && user.id === perfil.id;

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
          {MAZOS_PUBLICOS_MOCK.length > 0 ? (
            <div className="profile-decks-grid">
              {MAZOS_PUBLICOS_MOCK.map((mazo) => (
                <Card key={mazo.id} variant="default">
                  <p className="profile-deck__name">{mazo.nombre}</p>
                  <p className="profile-deck__meta">{mazo.formato} · {mazo.comandante}</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="Sin mazos públicos" description="Este jugador todavía no publicó mazos." />
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
