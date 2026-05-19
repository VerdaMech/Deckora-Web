import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords } from 'lucide-react';

import { listarTorneos, cambiarEstadoTorneo } from '@/services/torneos.service';
import { TournamentCard } from '@/components/domain/TournamentCard';
import { Button, Alert, Skeleton, EmptyState, Modal, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import './MisTorneosTab.css';

export default function MisTorneosTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [torneos, setTorneos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const [confirmar, setConfirmar] = useState(null);

  async function cargar() {
    if (!user?.id) return;
    setCargando(true);
    setError(null);
    try {
      const data = await listarTorneos({ limit: 100 });
      const todos = Array.isArray(data) ? data : data?.torneos ?? data?.data ?? [];
      setTorneos(
        todos.filter(
          (t) => t.creado_por === user.id || t.organizador_id === user.id || t.tienda_id === user.id
        )
      );
    } catch (e) {
      setError(e.message ?? 'Error al cargar tus torneos');
    } finally {
      setCargando(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { cargar(); }, [user?.id]);

  async function handleCancelar(torneo) {
    setCancelando(torneo.id);
    setConfirmar(null);
    try {
      await cambiarEstadoTorneo(torneo.id, 'cancelado');
      await cargar();
    } catch (e) {
      setError(e.message ?? 'Error al cancelar el torneo');
    } finally {
      setCancelando(null);
    }
  }

  if (cargando) {
    return (
      <div className="mis-torneos__grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={240} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}{' '}
        <button className="mis-torneos__reintentar" onClick={cargar}>Reintentar</button>
      </Alert>
    );
  }

  if (torneos.length === 0) {
    return (
      <EmptyState
        icon={Swords}
        title="No has creado torneos todavía"
        description="Publica tu primer torneo y empieza a organizar partidas de Magic."
        action={
          <Button variant="primary" onClick={() => navigate('/organizador/torneos/nuevo')}>
            Crear torneo
          </Button>
        }
      />
    );
  }

  return (
    <div className="mis-torneos">
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="mis-torneos__acciones-top">
        <Button variant="primary" size="sm" onClick={() => navigate('/organizador/torneos/nuevo')}>
          Crear torneo nuevo
        </Button>
      </div>

      <div className="mis-torneos__grid">
        {torneos.map((torneo) => (
          <div key={torneo.id} className="mis-torneos__item">
            <TournamentCard torneo={torneo} onClick={() => navigate(`/torneos/${torneo.id}`)} ocultarCupo />
            <div className="mis-torneos__card-actions">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/organizador/torneos/${torneo.id}/editar`)}
              >
                Editar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/organizador/torneos/${torneo.id}/gestion`)}
              >
                Gestionar
              </Button>
              {torneo.estado !== 'cancelado' && torneo.estado !== 'finalizado' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmar(torneo)}
                  disabled={cancelando === torneo.id}
                >
                  {cancelando === torneo.id ? <Spinner size="sm" /> : 'Cancelar'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {confirmar && (
        <Modal
          show
          onHide={() => setConfirmar(null)}
          title="Cancelar torneo"
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmar(null)}>Volver</Button>
              <Button
                variant="danger"
                onClick={() => handleCancelar(confirmar)}
                disabled={!!cancelando}
              >
                {cancelando ? <Spinner size="sm" /> : 'Confirmar cancelación'}
              </Button>
            </>
          }
        >
          <p className="mis-torneos__modal-texto">
            ¿Estás seguro de que deseas cancelar <strong>{confirmar.nombre}</strong>? Esta acción
            notificará a los inscritos.
          </p>
        </Modal>
      )}
    </div>
  );
}
