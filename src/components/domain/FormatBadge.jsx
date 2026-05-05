import { FORMATO_LABELS } from '@/utils/constants';
import './FormatBadge.css';

export function FormatBadge({ formato }) {
  if (!formato) return null;
  const label = FORMATO_LABELS[formato] ?? formato;

  return (
    <span className="format-badge" title={label}>
      {label}
    </span>
  );
}

export default FormatBadge;
