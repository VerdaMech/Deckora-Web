import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, FolderClosed, Swords, CalendarDays } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { EmptyState } from '@/components/ui';
import EstadisticasJugador from '@/components/domain/EstadisticasJugador';
import BloqueResumen from '../components/BloqueResumen';
import StatsRapidas from '../components/StatsRapidas';
import { listarMazosRecientes } from '@/services/mazos.service';
import { listarTorneosProximos } from '@/services/torneos.service';
import { obtenerMiColeccion } from '@/services/colecciones.service';
import './DashboardJugador.css';

export default function DashboardJugador() {
  const { user, perfil } = useAuth();
  const nombre = user?.nombre_usuario ?? user?.correo ?? 'Jugador';

  const [mazos, setMazos] = useState(null);
  const [torneos, setTorneos] = useState(null);
  const [coleccion, setColeccion] = useState(null);
  const [loadingMazos, setLoadingMazos] = useState(true);
  const [loadingTorneos, setLoadingTorneos] = useState(true);
  const [loadingColeccion, setLoadingColeccion] = useState(true);

  useEffect(() => {
    listarMazosRecientes(3)
      .then((data) => setMazos(Array.isArray(data) ? data : []))
      .catch(() => setMazos([]))
      .finally(() => setLoadingMazos(false));

    listarTorneosProximos(3)
      .then(({ data }) => setTorneos(data ?? []))
      .catch(() => setTorneos([]))
      .finally(() => setLoadingTorneos(false));

    obtenerMiColeccion()
      .then((res) => {
        const raw = res?.data ?? res;
        setColeccion(raw ?? null);
      })
      .catch(() => setColeccion(null))
      .finally(() => setLoadingColeccion(false));
  }, []);

  const totalMazos = mazos?.length ?? 0;
  const totalCartas = coleccion?.totalCartas ?? coleccion?.total_cartas ?? 0;
  const torneosJugados = perfil?.torneos_participados ?? 0;

  const statsItems = [
    { label: 'Mazos', valor: totalMazos, icono: Layers },
    { label: 'Cartas', valor: totalCartas, icono: FolderClosed },
    { label: 'Torneos jugados', valor: torneosJugados, icono: Swords },
  ];

  return (
    <div className="dashboard-jugador">
      <div className="dashboard-jugador__saludo">
        <h1 className="dashboard-jugador__bienvenida">
          Hola, <span className="dashboard-jugador__nombre">{nombre}</span>
        </h1>
        <p className="dashboard-jugador__subtitulo">
          Aquí tienes un resumen de tu actividad en Deckora.
        </p>
      </div>

      <StatsRapidas items={statsItems} className="dashboard-jugador__stats" />

      <div className="dashboard-jugador__seccion">
        <EstadisticasJugador usuarioId={user?.id} variante="compacto" />
      </div>

      <div className="dashboard-jugador__grid">
        <BloqueResumen
          titulo="Tus mazos recientes"
          icono={Layers}
          cta={{ texto: 'Ver todos', to: '/mazos' }}
          cargando={loadingMazos}
          vacio={!loadingMazos && mazos?.length === 0}
        >
          {mazos?.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="Sin mazos todavía"
              description="Crea tu primer mazo y aparecerá aquí."
              action={<Link to="/mazos" className="btn btn--ghost btn--sm">Crear mazo</Link>}
            />
          ) : (
            <ul className="dashboard-jugador__mazo-lista">
              {mazos?.map((mazo) => (
                <li key={mazo.id} className="dashboard-jugador__mazo-item">
                  <Link to={`/mazos/${mazo.id}`} className="dashboard-jugador__mazo-link">
                    <Layers size={14} className="dashboard-jugador__mazo-icono" aria-hidden="true" />
                    <span className="dashboard-jugador__mazo-nombre">{mazo.nombre}</span>
                    <span className="dashboard-jugador__mazo-formato">{mazo.formato}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </BloqueResumen>

        <div className="dashboard-jugador__col-derecha">
          <BloqueResumen
            titulo="Próximos torneos"
            icono={CalendarDays}
            cta={{ texto: 'Ver cartelera', to: '/torneos' }}
            cargando={loadingTorneos}
            vacio={!loadingTorneos && torneos?.length === 0}
          >
            {torneos?.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Sin torneos próximos"
                description="Cuando haya torneos disponibles aparecerán aquí."
              />
            ) : (
              <ul className="dashboard-jugador__torneo-lista">
                {torneos?.map((torneo) => (
                  <li key={torneo.id} className="dashboard-jugador__torneo-item">
                    <Link to={`/torneos/${torneo.id}`} className="dashboard-jugador__torneo-link">
                      <span className="dashboard-jugador__torneo-nombre">{torneo.nombre}</span>
                      <span className="dashboard-jugador__torneo-fecha">
                        {torneo.fecha ?? torneo.fecha_inicio
                          ? new Date(torneo.fecha ?? torneo.fecha_inicio).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
                          : '—'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </BloqueResumen>

          <BloqueResumen
            titulo="Tu colección"
            icono={FolderClosed}
            cta={{ texto: 'Abrir', to: '/colecciones' }}
            cargando={loadingColeccion}
            vacio={!loadingColeccion && !coleccion}
          >
            {!coleccion ? (
              <EmptyState
                icon={FolderClosed}
                title="Colección vacía"
                description="Agrega cartas para verlas aquí."
              />
            ) : (
              <div className="dashboard-jugador__coleccion">
                <p className="dashboard-jugador__coleccion-total">
                  <span className="dashboard-jugador__coleccion-numero">
                    {coleccion.totalCartas ?? coleccion.total_cartas ?? 0}
                  </span>
                  <span className="dashboard-jugador__coleccion-label">cartas en tu colección</span>
                </p>
                {(coleccion.ultimasAgregadas ?? coleccion.ultimas_agregadas)?.length > 0 && (
                  <p className="dashboard-jugador__coleccion-recientes">
                    Últimas agregadas: {(coleccion.ultimasAgregadas ?? coleccion.ultimas_agregadas)
                      .slice(0, 3)
                      .map((c) => c.nombre ?? c.name)
                      .join(', ')}
                  </p>
                )}
              </div>
            )}
          </BloqueResumen>
        </div>
      </div>
    </div>
  );
}
