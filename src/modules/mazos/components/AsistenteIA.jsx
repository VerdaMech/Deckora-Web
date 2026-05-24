import { useState, useCallback } from 'react';
import { Sparkles, RefreshCw, CheckCircle, PlusCircle, Wand2, Zap } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { getRecomendaciones, importarMazo } from '@/services/mazos.service';
import mazosPlantilla from '@/data/mazosPlantilla.json';
import './AsistenteIA.css';

function ExplicacionFormateada({ texto }) {
  return (
    <p className="asistente-ia__explicacion">
      {texto.split('\n').map((linea, i) => {
        const segmentos = linea.split(/\*\*([^*]+)\*\*/g);
        return (
          <span key={i} style={{ display: 'block' }}>
            {segmentos.map((seg, j) =>
              j % 2 === 1
                ? <span key={j} className="asistente-ia__carta-ref">{seg}</span>
                : seg
            )}
          </span>
        );
      })}
    </p>
  );
}

export function AsistenteIA({ mazo, onAplicarSugerencia, onAutocompletar, onMazoImportado }) {
  const [estado, setEstado] = useState('inicial');
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [explicacion, setExplicacion] = useState(null);
  const [error, setError] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMensaje, setToastMensaje] = useState('');

  const [estadoAutocompletar, setEstadoAutocompletar] = useState('inicial');
  const [resultadoAutocompletar, setResultadoAutocompletar] = useState(null);
  const [errorAutocompletar, setErrorAutocompletar] = useState(null);

  const plantillas = mazosPlantilla[mazo?.formato?.toUpperCase()] ?? [];
  const mazoVacio = (mazo?.cartas?.length ?? 0) === 0;

  const mostrarToastIA = useCallback((msg) => {
    setToastMensaje(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  async function pedirRecomendaciones() {
    setEstado('cargando');
    setError(null);
    try {
      const data = await getRecomendaciones(mazo.id);
      setRecomendaciones(data.recomendaciones ?? []);
      setExplicacion(data.explicacion ?? null);
      setEstado('resultado');
    } catch (err) {
      setError(err.message ?? 'No se pudieron obtener recomendaciones.');
      setEstado('inicial');
    }
  }

  function limpiar() {
    setEstado('inicial');
    setRecomendaciones([]);
    setExplicacion(null);
    setError(null);
  }

  function aplicar(carta) {
    if (onAplicarSugerencia) onAplicarSugerencia(carta);
    mostrarToastIA('Carta agregada al mazo');
  }

  async function handleAutocompletar() {
    if (mazoVacio && plantillas.length > 0) {
      const aleatoria = plantillas[Math.floor(Math.random() * plantillas.length)];
      return handleUsarPlantilla(aleatoria);
    }

    setEstadoAutocompletar('cargando');
    setErrorAutocompletar(null);
    try {
      await onAutocompletar();
      setEstadoAutocompletar('resultado');
    } catch (err) {
      setErrorAutocompletar(err.message ?? 'No se pudo autocompletar el mazo.');
      setEstadoAutocompletar('inicial');
    }
  }

  async function handleUsarPlantilla(plantilla) {
    setEstadoAutocompletar('cargando');
    setErrorAutocompletar(null);
    try {
      await importarMazo(mazo.id, plantilla.lista);
      if (onMazoImportado) onMazoImportado();
      setEstadoAutocompletar('resultado');
    } catch (err) {
      setErrorAutocompletar(err.message ?? 'No se pudo importar la plantilla.');
      setEstadoAutocompletar('inicial');
    }
  }

  function limpiarAutocompletar() {
    setEstadoAutocompletar('inicial');
    setResultadoAutocompletar(null);
    setErrorAutocompletar(null);
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
          {error && <p className="asistente-ia__error">{error}</p>}
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
          {explicacion && <ExplicacionFormateada texto={explicacion} />}

          <ul className="asistente-ia__lista">
            {recomendaciones.map((carta) => (
              <li key={carta.id} className="asistente-ia__sugerencia asistente-ia__sugerencia--agregar">
                <div className="asistente-ia__sugerencia-header">
                  <PlusCircle size={13} className="asistente-ia__tipo-icono" />
                  <span className="asistente-ia__tipo-label">Agregar</span>
                  <span className="asistente-ia__carta-nombre">{carta.nombre}</span>
                </div>
                <p className="asistente-ia__razon">
                  {carta.tipo}
                  {carta.costo_mana ? ` • ${carta.costo_mana}` : ''}
                  {carta.texto ? ` — ${carta.texto.slice(0, 80)}${carta.texto.length > 80 ? '…' : ''}` : ''}
                </p>
                <button
                  className="btn btn--ghost btn--sm asistente-ia__btn-aplicar"
                  type="button"
                  onClick={() => aplicar(carta)}
                >
                  <CheckCircle size={13} />
                  Agregar al mazo
                </button>
              </li>
            ))}
          </ul>

          <button
            className="btn btn--ghost btn--sm asistente-ia__btn-limpiar"
            type="button"
            onClick={limpiar}
          >
            <RefreshCw size={13} />
            Nueva búsqueda
          </button>
        </div>
      )}

      {onAutocompletar && (
        <>
          <div className="asistente-ia__separador" />

          {estadoAutocompletar === 'inicial' && (
            <div className="asistente-ia__autocompletar">
              {mazoVacio && plantillas.length > 0 ? (
                <>
                  <p className="asistente-ia__descripcion">
                    Tu mazo está vacío. Elige una plantilla para empezar rápido o deja que la IA lo genere desde cero.
                  </p>
                  {errorAutocompletar && <p className="asistente-ia__error">{errorAutocompletar}</p>}
                  <div className="asistente-ia__plantillas">
                    {plantillas.map((p) => (
                      <div key={p.id} className="asistente-ia__plantilla">
                        <div className="asistente-ia__plantilla-info">
                          <span className="asistente-ia__plantilla-nombre">{p.nombre}</span>
                          <span className="asistente-ia__plantilla-desc">{p.descripcion}</span>
                        </div>
                        <button
                          className="btn btn--secondary btn--sm"
                          type="button"
                          onClick={() => handleUsarPlantilla(p)}
                        >
                          <Zap size={13} />
                          Usar
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="asistente-ia__separador-plantilla" />
                </>
              ) : (
                <p className="asistente-ia__descripcion">
                  Deja que la IA complete tu mazo automáticamente con cartas compatibles hasta el límite del formato.
                </p>
              )}
              {errorAutocompletar && !mazoVacio && <p className="asistente-ia__error">{errorAutocompletar}</p>}
              <button
                className="btn btn--secondary btn--sm asistente-ia__btn-pedir"
                type="button"
                onClick={handleAutocompletar}
              >
                <Wand2 size={14} />
                Autocompletar con IA
              </button>
            </div>
          )}

          {estadoAutocompletar === 'cargando' && (
            <div className="asistente-ia__cargando">
              <Spinner size="sm" />
              <span className="asistente-ia__cargando-texto">La IA está completando tu mazo...</span>
            </div>
          )}

          {estadoAutocompletar === 'resultado' && (
            <div className="asistente-ia__autocompletar-resultado">
              <p className="asistente-ia__autocompletar-ok">
                Mazo completado con éxito.
              </p>
              <button
                className="btn btn--ghost btn--sm asistente-ia__btn-limpiar"
                type="button"
                onClick={limpiarAutocompletar}
              >
                <RefreshCw size={13} />
                Volver a autocompletar
              </button>
            </div>
          )}
        </>
      )}

      {toastVisible && (
        <div className="asistente-ia__toast" role="status">
          {toastMensaje}
        </div>
      )}
    </div>
  );
}

export default AsistenteIA;
