import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  warning: AlertCircle,
  danger: XCircle,
  info: Info,
};

/**
 * @param {{ variant?: 'success'|'warning'|'danger'|'info', icon?: boolean, children: React.ReactNode }} props
 */
export default function Alert({ variant = 'info', icon = true, children }) {
  const Icon = ICONS[variant];
  return (
    <div className={`alert-deckora alert--${variant}`} role="alert">
      {icon && Icon && <Icon size={18} className="alert__icon" />}
      <span className="alert__body font-small">{children}</span>
    </div>
  );
}
