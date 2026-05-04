import Spinner from './Spinner';

/**
 * @param {{
 *   variant?: 'primary'|'primary-clip'|'ghost'|'secondary'|'danger',
 *   size?: 'sm'|'md'|'lg',
 *   loading?: boolean,
 *   icon?: React.ComponentType<{ size: number }>,
 *   disabled?: boolean,
 *   type?: string,
 *   onClick?: Function,
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  disabled = false,
  type = 'button',
  onClick,
  children,
  className = '',
  ...rest
}) {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        Icon && <Icon size={iconSize} />
      )}
      {children}
    </button>
  );
}
