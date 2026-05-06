import { useState, useCallback } from 'react';
import { Sparkles, RefreshCw, CheckCircle, PlusCircle, MinusCircle } from 'lucide-react';
import { Spinner } from '@/components/ui';
import './AsistenteIA.css';

const SUGERENCIAS_MOCK = [
  {
    tipo: 'agregar',
    carta: {
      id: 'sol-ring',
      name: 'Sol Ring',
      mana_cost: '{1}',
      image_uris: { small: 'https://cards.scryfall.io/small/front/8/f/8f1b37be-f8f0-4035-9b27-8f8a0f3e6f0e.jpg' },
    },
    razon: 'Es el artefacto de aceleración de maná más eficiente del formato Commander.',
  },
  {
    tipo: 'agregar',
    carta: {
      id: 'command-tower',
      name: 'Command Tower',
      mana_cost: null,
      image_uris: { small: 'https://cards.scryfall.io/small/front/4/b/4b4b8b7c-a6b3-4c5b-b2b6-1a4f7b3b2f6e.jpg' },
    },
    razon: 'Tierra de referencia para Commander: produce cualquier color de tu identidad sin coste.',
  },
  {
    tipo: 'agregar',
    carta: {
      id: 'arcane-signet',
      name: 'Arcane Signet',
      mana_cost: '{2}',
      image_uris: { small: 'https://cards.scryfall.io/small/front/6/a/6a14fc5a-d4de-43ca-8dc6-c7a8f2f2f9b7.jpg' },
    },
    razon: 'Sello de maná versátil que encaja en cualquier mazo de dos o más colores.',
  },
];

const TIPO_ICONO = {
  agregar: PlusCircle,
  quitar: MinusCircle,
};

const TIPO_LABEL = {
  agregar: 'Agregar',
  quitar: 'Quitar',
};

export function AsistenteIA({ mazo, onAplicarSugerencia }) {
  const [estado, setEstado] = useState('inicial'); // 'inicial' | 'cargando' | 'resultado'
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMensaje, setToastMensaje] = useState('');

  const mostrarToastIA = useCallback((msg) => {
    setToastMensaje(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  function pedirRecomendaciones() {
    setEstado('cargando');
    setTimeout(() => setEstado('resultado'), 1500);
  }

  function limpiar() {
    setEstado('inicial');
  }

  function aplicar(sugerencia) {
    if (onAplicarSugerencia) onAplicarSugerencia(sugerencia);
    mostrarToastIA('Sugerencia aplicada (mock)');
  }

  return (
    <div className="asistente-ia">
      <div className="asistente-ia__header">
        <Sparkles size={16} className="asistente-ia__icono" aria-hidden="true" />
        <span className="asistente-ia__titulo">Asistente IA</span>
      </div>

      {estado === 'inicial' && (
        <div className="asistente-ia__inicial">
          <p className="asistente-ia__descripcion">
            Recibe sugerencias personalizadas para mejorar tu mazo basadas en tu lista actual.
          </p>
          <button
            className="btn btn--primary btn--sm asistente-ia__btn-pedir"
            type="button"
            onClick={pedirRecomendaciones}
          >
            <Sparkles size={14} />
            Pedir recomendaciones
          </button>
        </div>
      )}

      {estado === 'cargando' && (
        <div className="asistente-ia__cargando">
          <Spinner size="sm" />
          <span className="asistente-ia__cargando-texto">Analizando tu mazo...</span>
        </div>
      )}

      {estado === 'resultado' && (
        <div className="asistente-ia__resultado">
          <ul className="asistente-ia__lista">
            {SUGERENCIAS_MOCK.map((s) => {
              const TipoIcono = TIPO_ICONO[s.tipo] ?? PlusCircle;
              return (
                <li key={s.carta.id} className={`asistente-ia__sugerencia asistente-ia__sugerencia--${s.tipo}`}>
                  <div className="asistente-ia__sugerencia-header">
                    <TipoIcono size={13} className="asistente-ia__tipo-icono" />
                    <span className="asistente-ia__tipo-label">{TIPO_LABEL[s.tipo]}</span>
                    <span className="asistente-ia__carta-nombre">{s.carta.name}</span>
                  </div>
                  <p className="asistente-ia__razon">{s.razon}</p>
                  <button
                    className="btn btn--ghost btn--sm asistente-ia__btn-aplicar"
                    type="button"
                    onClick={() => aplicar(s)}
                  >
                    <CheckCircle size={13} />
                    Aplicar
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            className="btn btn--ghost btn--sm asistente-ia__btn-limpiar"
            type="button"
            onClick={limpiar}
          >
            <RefreshCw size={13} />
            Limpiar
          </button>
        </div>
      )}

      <p className="asistente-ia__disclaimer">
        Sugerencias generadas con IA real próximamente.
      </p>

      {toastVisible && (
        <div className="asistente-ia__toast" role="status">
          {toastMensaje}
        </div>
      )}
    </div>
  );
}

export default AsistenteIA;
