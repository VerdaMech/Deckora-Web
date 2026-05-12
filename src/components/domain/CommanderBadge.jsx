import { Crown } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import './CommanderBadge.css';

const DESCRIPCION = 'Carta legendaria que lidera el mazo. Su identidad de color define qué cartas pueden incluirse.';

export function CommanderBadge() {
  return (
    <Tooltip content={DESCRIPCION} placement="top">
      <span className="commander-badge">
        <Crown size={10} />
        CMDR
      </span>
    </Tooltip>
  );
}

export default CommanderBadge;
