/**
 * @param {{
 *   variant?: 'default'|'elevated'|'interactive'|'feature',
 *   as?: string,
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function Card({
  variant = 'default',
  as: Tag = 'div',
  children,
  className = '',
  ...rest
}) {
  return (
    <Tag className={`card card--${variant} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
