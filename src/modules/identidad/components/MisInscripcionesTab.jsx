import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { listarTorneos, listarInscripciones, cancelarInscripcion } from '@/services/torneos.service';
import { TournamentCard } from '@/components/domain/TournamentCard';
import { Button, Alert, Skeleton, EmptyState } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import './MisInscripcionesTab.css';

// TODO: reemplazar por endpoint /usuarios/:id/inscripciones cuando exista
async function obtenerMisInscripcionesFallback(userId) {
  const data = await listarTorneos({ limit: 50 });
  const todosTorneos = Array.isArray(data) ? data : data?.torneos ?? data?.data ?? [];

  const resultados = await Promise.allSettled(
    todosTorneos.map(async (torneo) => {
      const ins = await listarInscripciones(torneo.id).catch(() => []);
      const lista = Array.isArray(ins) ? ins : ins?.inscripciones ?? ins?.data ?? [];
      const inscripcion = lista.find(
        (i) => i.usuario_id === userId || i.jugador_id === userId
      );
      if (inscripcion) return { torneo, inscripcion };
      return null;
    })
  );

  return resultados
    .filter((r) => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value);
}

export default function MisInscripcionesTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null);

  async function cargar() {
    if (!user?.id) return;
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerMisInscripcionesFallback(user.id);
      setItems(data);
    } catch (e) {
      setError(e.message ?? 'Error al cargar tus inscripciones');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, [user?.id]);

  async function handleCancelar(torneoId, inscripcionId) {
    setCancelando(inscripcionId);
    try {
      await cancelarInscripcion(torneoId, inscripcionId);
      await cargar();
    } catch (e) {
      setError(e.message ?? 'Error al cancelar la inscripción');
    } finally {
      setCancelando(null);
    }
  }

  if (cargando) {
    return (
      <div className="mis-inscripciones__grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={220} className="mis-inscripciones__skeleton" />
        ))}
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No estás inscrito en torneos próximos"
        description="Explora la cartelera y encuentra tu próximo torneo de Magic."
        action={
          <Button variant="primary" onClick={() => navigate('/torneos')}>
            Ver cartelera
          </Button>
        }
      />
    );
  }

  return (
    <div className="mis-inscripciones">
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="mis-inscripciones__grid">
        {items.map(({ torneo, inscripcion }) => (
          <div key={inscripcion.id} className="mis-inscripciones__item">
            <TournamentCard
              torneo={torneo}
              onClick={() => navigate(`/torneos/${torneo.id}`)}
            />
            <div className="mis-inscripciones__actions">
              <span className="mis-inscripciones__mazo">
                {inscripcion.mazo?.nombre ? `Mazo: ${inscripcion.mazo.nombre}` : 'Inscrito'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCancelar(torneo.id, inscripcion.id)}
                disabled={cancelando === inscripcion.id}
              >
                {cancelando === inscripcion.id ? 'Cancelando...' : 'Cancelar inscripción'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
