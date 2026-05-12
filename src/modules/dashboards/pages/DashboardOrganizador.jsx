import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Trophy, CheckCircle } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { EmptyState } from '@/components/ui';
import BloqueResumen from '../components/BloqueResumen';
import StatsRapidas from '../components/StatsRapidas';
import { listarMisTorneos } from '@/services/torneos.service';
import './DashboardOrganizador.css';

export default function DashboardOrganizador() {
  const { user, perfil } = useAuth();
  const nombre = user?.nombre_usuario ?? user?.correo ?? 'Organizador';
  const username = user?.nombre_usuario ?? '';

  const [torneos, setTorneos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarMisTorneos(user?.id)
      .then(({ data }) => setTorneos(data ?? []))
      .catch(() => setTorneos([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const proximos = torneos?.filter((t) => t.estado === 'pendiente' || t.estado === 'activo') ?? [];
  const finalizados = torneos?.filter((t) => t.estado === 'finalizado') ?? [];
  const recientes = torneos
    ? [...torneos].sort((a, b) => new Date(b.createdAt ?? b.created_at ?? 0) - new Date(a.createdAt ?? a.created_at ?? 0)).slice(0, 5)
    : [];

  const statsItems = [
    { label: 'Torneos creados', valor: torneos?.length ?? 0, icono: CalendarDays },
    { label: 'Próximos', valor: proximos.length, icono: Trophy },
    { label: 'Finalizados', valor: finalizados.length, icono: CheckCircle },
  ];

  return (
    <div className="dashboard-organizador">
      <div className="dashboard-organizador__saludo">
        <h1 className="dashboard-organizador__bienvenida">
          Hola, <span className="dashboard-organizador__nombre">{nombre}</span>
        </h1>
        <p className="dashboard-organizador__subtitulo">
          Gestiona tus torneos y mantén tu comunidad activa.
        </p>
      </div>

      <StatsRapidas items={statsItems} />

      <BloqueResumen
        titulo="Mis torneos recientes"
        icono={CalendarDays}
        cta={username ? { texto: 'Ver perfil', to: `/u/${username}` } : undefined}
        cargando={loading}
        vacio={!loading && torneos?.length === 0}
      >
        {torneos?.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Sin torneos creados"
            description="Crea tu primer torneo para verlo aquí."
            action={
              <Link to="/organizador/torneos/nuevo" className="btn btn--primary btn--sm">
                Crear torneo
              </Link>
            }
          />
        ) : (
          <ul className="dashboard-organizador__torneo-lista">
            {recientes.map((torneo) => (
              <li key={torneo.id} className="dashboard-organizador__torneo-item">
                <Link to={`/torneos/${torneo.id}`} className="dashboard-organizador__torneo-link">
                  <span className="dashboard-organizador__torneo-nombre">{torneo.nombre}</span>
                  <span className={`dashboard-organizador__torneo-estado dashboard-organizador__torneo-estado--${torneo.estado ?? 'pendiente'}`}>
                    {torneo.estado ?? 'pendiente'}
                  </span>
                  <span className="dashboard-organizador__torneo-fecha">
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

    </div>
  );
}
