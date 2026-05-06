import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { crearTorneo } from '@/services/torneos.service';
import FormularioTorneo from '../components/FormularioTorneo';
import './CrearTorneo.css';

export default function CrearTorneo() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(datos) {
    setSubmitting(true);
    try {
      const torneo = await crearTorneo(datos);
      const id = torneo?.id ?? torneo?.torneo?.id;
      navigate(id ? `/torneos/${id}` : '/torneos');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="crear-torneo-page">
      <div className="crear-torneo-page__header">
        <h1 className="crear-torneo-page__title">Crear torneo</h1>
        <p className="crear-torneo-page__subtitle">
          Completá los datos para publicar tu torneo.
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
