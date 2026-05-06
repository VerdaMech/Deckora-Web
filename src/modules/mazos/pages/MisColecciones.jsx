import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderClosed } from 'lucide-react';

import { Spinner, Alert, EmptyState, Card } from '@/components/ui';
import { obtenerMiColeccion } from '@/services/colecciones.service';

import './MisColecciones.css';

export default function MisColecciones() {
  const [coleccion, setColeccion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function cargar() {
    setCargando(true);
    setError(null);
    obtenerMiColeccion()
      .then((data) => setColeccion(data))
      .catch((err) => setError(err.message ?? 'Error al cargar la colección'))
      .finally(() => setCargando(false));
  }

  useEffect(() => { cargar(); }, []);

  return (
    <div className="mis-colecciones">
      <div className="mis-colecciones__header">
        <h1 className="mis-colecciones__titulo font-h2">Mis colecciones</h1>
        <p className="mis-colecciones__descripcion font-body">
          Administra tus cartas: cantidad, foil y organización.
        </p>
      </div>

      {cargando && (
        <div className="mis-colecciones__loading">
          <Spinner />
        </div>
      )}

      {error && !cargando && (
        <Alert variant="danger">
          {error}
          <button
            className="btn btn--ghost btn--sm mis-colecciones__retry"
            type="button"
            onClick={cargar}
          >
            Reintentar
          </button>
        </Alert>
      )}

      {!cargando && !error && coleccion && (
        coleccion.totalCartas === 0 || (Array.isArray(coleccion.cartas) && coleccion.cartas.length === 0) ? (
          <EmptyState
            icon={FolderClosed}
            title="Tu colección está vacía"
            description="Crea una colección para organizar tus cartas y hacer seguimiento de tu inventario."
            action={
              <button
                className="btn btn--primary btn--md"
                type="button"
                onClick={() => navigate(`/colecciones/${coleccion.id}`)}
              >
                Agregar cartas
              </button>
            }
          />
        ) : (
          <div className="mis-colecciones__grid">
            <Card
              variant="interactive"
              className="mis-colecciones__card"
              onClick={() => navigate(`/colecciones/${coleccion.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/colecciones/${coleccion.id}`)}
            >
              <div className="mis-colecciones__card-inner">
                <FolderClosed size={32} className="mis-colecciones__card-icon" />
                <div className="mis-colecciones__card-info">
                  <span className="mis-colecciones__card-titulo font-h4">Mi colección</span>
                  <span className="mis-colecciones__card-meta font-small">
                    {coleccion.totalCartas ?? coleccion.cartas?.length ?? 0} cartas
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )
      )}
    </div>
  );
}
