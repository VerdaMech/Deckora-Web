import Tooltip from '@/components/ui/Tooltip';
import { FORMATO_LABELS } from '@/utils/constants';
import './FormatBadge.css';

const FORMATO_DESCRIPCIONES = {
  COMMANDER: 'Formato singleton de 100 cartas con un comandante. Cada carta única, salvo tierras básicas.',
  STANDARD: 'Formato con cartas de los últimos años. Rotación periódica de sets.',
  MODERN: 'Formato con cartas desde 2003. Sin rotación. Pool amplio y diverso.',
  PIONEER: 'Formato con cartas desde 2012. Sin rotación. Puente entre Standard y Modern.',
  LEGACY: 'Formato histórico con casi toda la colección de Magic impresa.',
};

export function FormatBadge({ formato }) {
  if (!formato) return null;
  const label = FORMATO_LABELS[formato] ?? formato;
  const descripcion = FORMATO_DESCRIPCIONES[formato];

  const badge = (
    <span className="format-badge">
      {label}
    </span>
  );

  if (!descripcion) return badge;

  return (
    <Tooltip content={descripcion} placement="top">
      {badge}
    </Tooltip>
  );
}

export default FormatBadge;
