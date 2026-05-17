import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { listarMisInscripciones, cancelarInscripcion } from '@/services/torneos.service';
import { TournamentCard } from '@/components/domain/TournamentCard';
import { Button, Alert, Skeleton, EmptyState } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';
import './MisInscripcionesTab.css';

export default function MisInscripcionesTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mostrarExito, mostrarError } = useToast();
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null);

  async function cargar() {
    if (!user?.id) return;
    setCargando(true);
    setError(null);
    try {
      const data = await listarMisInscripciones();
      const normalizado = data.map((item) =>
        item.torneo ? item : { torneo: item, inscripcion: item }
      );
      setItems(normalizado);
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
      mostrarExito('Inscripción cancelada', 'Tu inscripción fue cancelada correctamente.');
      await cargar();
    } catch (e) {
      const msg = traducirError(e);
      setError(msg);
      mostrarError('No se pudo cancelar', msg);
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
