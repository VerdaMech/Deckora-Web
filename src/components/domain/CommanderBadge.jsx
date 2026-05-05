import { Crown } from 'lucide-react';
import './CommanderBadge.css';

export function CommanderBadge() {
  return (
    <span className="commander-badge">
      <Crown size={10} />
      CMDR
    </span>
  );
}

export default CommanderBadge;
