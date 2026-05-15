import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Plus } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Button, Alert, EmptyState, Skeleton } from '@/components/ui';
import { TournamentCard } from '@/components/domain/TournamentCard';
import { listarTorneos } from '@/services/torneos.service';
import './MisTorneos.css';

export default function MisTorneos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [torneos, setTorneos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    setCargando(true);
    setError(null);
    listarTorneos({ organizador_id: user.id })
      .then((data) => setTorneos(Array.isArray(data) ? data : data?.torneos ?? data?.data ?? []))
      .catch((e) => setError(e.message ?? 'Error al cargar torneos'))
      .finally(() => setCargando(false));
  }, [user?.id]);

  return (
    <div className="mis-torneos-page">
      <div className="mis-torneos-page__header">
        <div>
          <h1 className="mis-torneos-page__title">Mis torneos</h1>
          <p className="mis-torneos-page__subtitle">Torneos que has creado y organizado.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/organizador/torneos/nuevo')}>
          Crear torneo
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {cargando && (
        <div className="mis-torneos-page__grid">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={260} />)}
        </div>
      )}

      {!cargando && !error && torneos.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="Sin torneos creados"
          description="Crea tu primer torneo para que aparezca aquí."
          action={
            <Button variant="primary" onClick={() => navigate('/organizador/torneos/nuevo')}>
              Crear torneo
            </Button>
          }
        />
      )}

      {!cargando && !error && torneos.length > 0 && (
        <div className="mis-torneos-page__grid">
          {torneos.map((torneo) => (
            <TournamentCard
              key={torneo.id}
              torneo={torneo}
              onClick={() => navigate(`/torneos/${torneo.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
