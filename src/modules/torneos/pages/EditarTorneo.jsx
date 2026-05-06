import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { obtenerTorneo, actualizarTorneo } from '@/services/torneos.service';
import FormularioTorneo from '../components/FormularioTorneo';
import { Alert, Skeleton, Button } from '@/components/ui';
import './EditarTorneo.css';

export default function EditarTorneo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [torneo, setTorneo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerTorneo(id);
      setTorneo(data?.torneo ?? data);
    } catch (e) {
      setError(e.message ?? 'Error al cargar el torneo');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleSubmit(datos) {
    setSubmitting(true);
    try {
      await actualizarTorneo(id, datos);
      navigate(`/torneos/${id}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (cargando) {
    return (
      <div className="editar-torneo-page">
        <Skeleton height={48} className="editar-torneo-page__skeleton-title" />
        <Skeleton height={480} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="editar-torneo-page editar-torneo-page--error">
        <Alert variant="danger">{error}</Alert>
        <Button variant="ghost" onClick={() => navigate('/torneos')}>Volver a cartelera</Button>
      </div>
    );
  }

  return (
    <div className="editar-torneo-page">
      <div className="editar-torneo-page__header">
        <h1 className="editar-torneo-page__title">Editar torneo</h1>
        <p className="editar-torneo-page__subtitle">{torneo?.nombre}</p>
      </div>
      <div className="editar-torneo-page__body">
        <FormularioTorneo
          torneoInicial={torneo}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  );
}
