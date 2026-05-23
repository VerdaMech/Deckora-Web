import { Modal } from '@/components/ui';
import { ManaCost, OracleText } from './ManaCost';
import './CartaDetalleModal.css';

const FORMATOS_LEGALITIES = [
  'standard', 'pioneer', 'modern', 'legacy', 'vintage',
  'commander', 'pauper', 'historic', 'explorer', 'alchemy', 'brawl',
];

function LegalityBadge({ status }) {
  return (
    <span className={`carta-detalle__legality-badge carta-detalle__legality-badge--${status ?? 'not_legal'}`}>
      {status === 'legal' ? 'Legal'
        : status === 'banned' ? 'Prohibida'
        : status === 'restricted' ? 'Restringida'
        : 'No legal'}
    </span>
  );
}

export function CartaDetalleModal({ carta, onClose }) {
  if (!carta) return null;

  const nombre = carta.nombre ?? carta.name ?? '';
  const imagenUrl = carta.imagen_url ?? carta.image_uris?.normal ?? null;
  const manaCost = carta.costo_mana ?? carta.mana_cost ?? '';
  const tipo = carta.tipo ?? carta.type_line ?? '';
  const texto = carta.texto ?? carta.oracle_text ?? '';

  return (
    <Modal show={!!carta} onHide={onClose} title={nombre} size="xl">
      <div className="carta-detalle">
        <div className="carta-detalle__imagen">
          {imagenUrl ? (
            <img src={imagenUrl} alt={nombre} className="carta-detalle__img" />
          ) : (
            <div className="carta-detalle__placeholder">{nombre}</div>
          )}
        </div>

        <div className="carta-detalle__info">
          <div className="carta-detalle__mana-tipo">
            <span className="carta-detalle__tipo">{tipo}</span>
            {manaCost && <ManaCost cost={manaCost} />}
          </div>

          {texto && (
            <OracleText text={texto} className="carta-detalle__texto" />
          )}

          {carta.fuerza != null && carta.resistencia != null && (
            <p className="carta-detalle__pt">
              {carta.fuerza} / {carta.resistencia}
            </p>
          )}

          {(carta.set_nombre || carta.set_fecha_lanzamiento) && (
            <div className="carta-detalle__set">
              {carta.set_nombre && <span>{carta.set_nombre}</span>}
              {carta.set_fecha_lanzamiento && (
                <span>
                  {new Date(carta.set_fecha_lanzamiento).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
              )}
            </div>
          )}

          {carta.legalities && (
            <div className="carta-detalle__legalities">
              <p className="carta-detalle__legalities-titulo">Legalidades</p>
              <div className="carta-detalle__legalities-grid">
                {FORMATOS_LEGALITIES.map((formato) => (
                  <div key={formato} className="carta-detalle__legality-item">
                    <LegalityBadge status={carta.legalities[formato]} />
                    <span className="carta-detalle__legality-formato">{formato}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CartaDetalleModal;
