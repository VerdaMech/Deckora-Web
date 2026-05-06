import './StatsRapidas.css';

export default function StatsRapidas({ items = [], className = '' }) {
  return (
    <div className={`stats-rapidas ${className}`.trim()}>
      {items.map(({ label, valor, icono: Icono }) => (
        <div key={label} className="stats-rapidas__item">
          {Icono && <Icono size={22} className="stats-rapidas__icono" aria-hidden="true" />}
          <span className="stats-rapidas__valor">{valor ?? '—'}</span>
          <span className="stats-rapidas__label">{label}</span>
        </div>
      ))}
    </div>
  );
}
