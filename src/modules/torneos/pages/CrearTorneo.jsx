import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { crearTorneo } from '@/services/torneos.service';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';
import FormularioTorneo from '../components/FormularioTorneo';
import './CrearTorneo.css';

export default function CrearTorneo() {
  const navigate = useNavigate();
  const { mostrarExito, mostrarError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(datos) {
    setSubmitting(true);
    try {
      const torneo = await crearTorneo(datos);
      const id = torneo?.id ?? torneo?.torneo?.id;
      mostrarExito('Torneo creado', 'Tu torneo fue publicado correctamente.');
      navigate(id ? `/torneos/${id}` : '/torneos');
    } catch (err) {
      mostrarError('No se pudo crear el torneo', traducirError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="crear-torneo-page">
      <div className="crear-torneo-page__header">
        <h1 className="crear-torneo-page__title">Crear torneo</h1>
        <p className="crear-torneo-page__subtitle">
          Completa los datos para publicar tu torneo.
        </p>
      </div>
      <div className="crear-torneo-page__body">
        <FormularioTorneo
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Crear torneo"
        />
      </div>
    </div>
  );
}
