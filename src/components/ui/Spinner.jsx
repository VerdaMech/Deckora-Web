const SIZES = { sm: 16, md: 24, lg: 40 };

export default function Spinner({ size = 'md', className = '', mostrarColdStart = false }) {
  const px = SIZES[size] ?? SIZES.md;
  const r = px / 2 - 3;
  const circumference = 2 * Math.PI * r;

  return (
    <div className={`spinner-wrapper ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        className="spinner"
        aria-label="Cargando"
        role="status"
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
      {mostrarColdStart && (
        <p className="spinner-cold-start">
          El servidor está despertando. Esto puede tardar hasta un minuto…
        </p>
      )}
    </div>
  );
}
