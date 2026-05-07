import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Users, Trophy, PlusCircle, Settings, User } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Button, EmptyState } from '@/components/ui';
import BloqueResumen from '../components/BloqueResumen';
import StatsRapidas from '../components/StatsRapidas';
import { listarTorneosDeTienda } from '@/services/tiendas.service';
import './DashboardTienda.css';

export default function DashboardTienda() {
  const { user, perfil } = useAuth();
  const nombre = perfil?.nombre_tienda ?? user?.nombre_usuario ?? user?.correo ?? 'Tienda';
  const username = user?.nombre_usuario ?? '';
  const tiendaId = user?.id;

  const [torneos, setTorneos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarTorneosDeTienda(tiendaId)
      .then(({ data }) => setTorneos(data ?? []))
      .catch(() => setTorneos([]))
      .finally(() => setLoading(false));
  }, [tiendaId]);

  const ahora = new Date();
  const proximos = torneos?.filter((t) => {
    const fecha = t.fecha ?? t.fecha_inicio;
    return fecha && new Date(fecha) > ahora;
  }) ?? [];

  // TODO: endpoint pendiente — asistentes totales no está disponible en el backend
  const asistentesTotales = null;

  const statsItems = [
    { label: 'Torneos publicados', valor: torneos?.length ?? 0, icono: Trophy },
    { label: 'Próximos', valor: proximos.length, icono: CalendarDays },
    { label: 'Asistentes totales', valor: asistentesTotales ?? '—', icono: Users },
  ];

  return (
    <div className="dashboard-tienda">
      <div className="dashboard-tienda__saludo">
        <h1 className="dashboard-tienda__bienvenida">
          Hola, <span className="dashboard-tienda__nombre">{nombre}</span>
        </h1>
        <p className="dashboard-tienda__subtitulo">
          Gestiona los eventos de tu tienda y conecta con la comunidad.
        </p>
      </div>

      <StatsRapidas items={statsItems} />

      <BloqueResumen
        titulo="Próximos eventos"
        icono={CalendarDays}
        cta={{ texto: 'Ver cartelera', to: '/torneos' }}
        cargando={loading}
        vacio={!loading && proximos.length === 0}
      >
        {proximos.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Sin eventos próximos"
            description="Crea un torneo para publicar eventos en tu tienda."
            action={
              <Link to="/organizador/torneos/nuevo" className="btn btn--primary btn--sm">
                Crear torneo
              </Link>
            }
          />
        ) : (
          <ul className="dashboard-tienda__torneo-lista">
            {proximos.map((torneo) => (
              <li key={torneo.id} className="dashboard-tienda__torneo-item">
                <Link to={`/torneos/${torneo.id}`} className="dashboard-tienda__torneo-link">
                  <span className="dashboard-tienda__torneo-nombre">{torneo.nombre}</span>
                  <span className="dashboard-tienda__torneo-fecha">
                    {torneo.fecha ?? torneo.fecha_inicio
                      ? new Date(torneo.fecha ?? torneo.fecha_inicio).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </BloqueResumen>

      <BloqueResumen titulo="Acciones rápidas" icono={PlusCircle}>
        <div className="dashboard-tienda__acciones">
          <Link to="/organizador/torneos/nuevo">
            <Button variant="primary" icon={PlusCircle}>Crear torneo</Button>
          </Link>
          <Link to="/configuracion?tab=tienda">
            <Button variant="secondary" icon={Settings}>Configurar mi tienda</Button>
          </Link>
          {username && (
            <Link to={`/u/${username}`}>
              <Button variant="ghost" icon={User}>Ver mi perfil público</Button>
            </Link>
          )}
        </div>
      </BloqueResumen>
    </div>
  );
}
