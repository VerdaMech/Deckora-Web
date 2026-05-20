import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

import { Modal, Alert, Spinner } from '@/components/ui';
import { importarMazo } from '@/services/mazos.service';

import './ImportarMazoModal.css';

const PLACEHOLDER = `1 Krenko, Mob Boss (PLST) DDT-52
1 Agate Instigator (BLC) 21
1 Arcane Signet (ECC) 55
1 Blasphemous Act (TMC) 47`;

export function ImportarMazoModal({ show, mazoId, onHide, onImportado }) {
  const [lista, setLista] = useState('');
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!lista.trim()) return;

    setImportando(true);
    setError(null);
    setResultado(null);

    try {
      const res = await importarMazo(mazoId, lista.trim());
      setResultado(res);
      if (res.importadas.length > 0) onImportado?.();
    } catch (err) {
      setError(err.message ?? 'Error al importar el mazo');
    } finally {
      setImportando(false);
    }
  }

  function handleHide() {
    if (importando) return;
    setLista('');
    setResultado(null);
    setError(null);
    onHide();
  }

  return (
    <Modal
      show={show}
      onHide={handleHide}
      title="Importar cartas"
      size="md"
      footer={
        <div className="importar-mazo__footer">
          <button
            className="btn btn--secondary btn--md"
            type="button"
            onClick={handleHide}
            disabled={importando}
          >
            {resultado ? 'Cerrar' : 'Cancelar'}
          </button>
          {!resultado && (
            <button
              className="btn btn--primary btn--md"
              type="submit"
              form="form-importar-mazo"
              disabled={importando || !lista.trim()}
            >
              {importando ? <Spinner size="sm" /> : null}
              Importar
            </button>
          )}
        </div>
      }
    >
      {!resultado ? (
        <form id="form-importar-mazo" onSubmit={handleSubmit} className="importar-mazo__form">
          <p className="importar-mazo__desc">
            Pega la lista de cartas en formato de texto. Una carta por línea:
          </p>
          <code className="importar-mazo__ejemplo">
            1 Krenko, Mob Boss (PLST) DDT-52
          </code>

          {error && <Alert variant="danger">{error}</Alert>}

          <textarea
            className="importar-mazo__textarea"
            value={lista}
            onChange={(e) => setLista(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={12}
            disabled={importando}
            autoFocus
          />
        </form>
      ) : (
        <div className="importar-mazo__resultado">
          {resultado.importadas.length > 0 && (
            <div className="importar-mazo__seccion">
              <h4 className="importar-mazo__seccion-titulo importar-mazo__seccion-titulo--ok">
                <CheckCircle size={15} />
                {resultado.importadas.length} carta{resultado.importadas.length !== 1 ? 's' : ''} importada{resultado.importadas.length !== 1 ? 's' : ''}
              </h4>
              <ul className="importar-mazo__lista">
                {resultado.importadas.map((item, i) => (
                  <li key={i} className="importar-mazo__item importar-mazo__item--ok">
                    <span className="importar-mazo__cantidad">{item.cantidad}x</span>
                    {item.nombre}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resultado.fallidas.length > 0 && (
            <div className="importar-mazo__seccion">
              <h4 className="importar-mazo__seccion-titulo importar-mazo__seccion-titulo--error">
                <XCircle size={15} />
                {resultado.fallidas.length} línea{resultado.fallidas.length !== 1 ? 's' : ''} con error
              </h4>
              <ul className="importar-mazo__lista">
                {resultado.fallidas.map((item, i) => (
                  <li key={i} className="importar-mazo__item importar-mazo__item--error">
                    <span className="importar-mazo__error-msg">{item.error}</span>
                    <span className="importar-mazo__linea-original">{item.linea}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default ImportarMazoModal;
