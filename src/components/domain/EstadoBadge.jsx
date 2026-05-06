export function EstadoBadge({ estado }) {
  if (!estado) return null;

  const normalizado = estado.toLowerCase();
  const claseModificador =
    normalizado === 'pendiente' ? 'warning'
    : normalizado === 'en_curso' ? 'info'
    : normalizado === 'finalizado' ? 'success'
    : normalizado === 'cancelado' ? 'muted'
    : 'muted';

  const label =
    normalizado === 'pendiente' ? 'Pendiente'
    : normalizado === 'en_curso' ? 'En curso'
    : normalizado === 'finalizado' ? 'Finalizado'
    : normalizado === 'cancelado' ? 'Cancelado'
    : estado;

  return (
    <span className={`estado-badge estado-badge--${claseModificador}`}>
      {label}
    </span>
  );
}

export default EstadoBadge;
