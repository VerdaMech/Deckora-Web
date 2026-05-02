const SIZES = { sm: 16, md: 24, lg: 40 };

/**
 * @param {{ size?: 'sm'|'md'|'lg', className?: string }} props
 */
export default function Spinner({ size = 'md', className = '' }) {
  const px = SIZES[size] ?? SIZES.md;
  const r = px / 2 - 3;
  const circumference = 2 * Math.PI * r;

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      className={`spinner ${className}`}
      aria-label="Cargando"
      role="status"
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2.5"
        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
        strokeLinecap="round"
      />
    </svg>
  );
}
