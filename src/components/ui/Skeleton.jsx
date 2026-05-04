/**
 * @param {{ width?: string|number, height?: string|number, radius?: string, className?: string }} props
 */
export default function Skeleton({ width, height, radius = 'var(--radius-md)', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{
        width: width ?? '100%',
        height: height ?? '1rem',
        borderRadius: radius,
      }}
    />
  );
}
