import {
  FORMATO_LABELS,
  ESTADO_TORNEO_LABELS,
  ROLES,
  RESULTADO_ENFRENTAMIENTO,
} from '@/utils/constants';

const ROLE_LABELS = {
  [ROLES.JUGADOR]: 'Jugador',
  [ROLES.ORGANIZADOR]: 'Organizador',
  [ROLES.TIENDA]: 'Tienda',
};

const RESULTADO_LABELS = {
  [RESULTADO_ENFRENTAMIENTO.GANADOR]: 'Ganador',
  [RESULTADO_ENFRENTAMIENTO.PERDEDOR]: 'Perdedor',
  [RESULTADO_ENFRENTAMIENTO.EMPATE]: 'Empate',
  [RESULTADO_ENFRENTAMIENTO.PENDIENTE]: 'Pendiente',
};

function resolveLabel(variant, value) {
  if (variant === 'format') return FORMATO_LABELS[value] ?? value;
  if (variant === 'estado') return ESTADO_TORNEO_LABELS[value] ?? value;
  if (variant === 'rol') return ROLE_LABELS[value] ?? value;
  if (variant === 'resultado') return RESULTADO_LABELS[value] ?? value;
  return value;
}

/**
 * @param {{ variant?: 'format'|'estado'|'rol'|'resultado'|'default', value?: string, children?: React.ReactNode }} props
 */
export default function Badge({ variant = 'default', value, children }) {
  const label = children ?? (value ? resolveLabel(variant, value) : '');
  const valueSlug = value ? value.toLowerCase().replace(/_/g, '-') : '';
  const cls = ['badge-deckora', `badge--${variant}`, valueSlug ? `badge--${variant}--${valueSlug}` : '']
    .filter(Boolean)
    .join(' ');

  return <span className={cls}>{label}</span>;
}
