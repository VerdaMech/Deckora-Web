import { User, Swords, Store } from 'lucide-react';

const ROLES = [
  {
    valor: 'jugador',
    label: 'Jugador',
    Icono: User,
    descripcion: 'Construí mazos, participá en torneos.',
  },
  {
    valor: 'organizador',
    label: 'Organizador',
    Icono: Swords,
    descripcion: 'Organizá y gestioná torneos.',
  },
  {
    valor: 'tienda',
    label: 'Tienda',
    Icono: Store,
    descripcion: 'Difundí tus eventos y atraé jugadores.',
  },
];

export default function SelectorRol({ value, onChange, disabled = false }) {
  return (
    <div className="selector-rol">
      {ROLES.map(({ valor, label, Icono, descripcion }) => {
        const activo = value === valor;
        return (
          <button
            key={valor}
            type="button"
            disabled={disabled}
            onClick={() => onChange(valor)}
            className={
              'selector-rol__option' +
              (activo ? ' selector-rol__option--active' : '') +
              (disabled ? ' selector-rol__option--disabled' : '')
            }
          >
            <div className="selector-rol__icon">
              <Icono size={32} />
            </div>
            <div className="selector-rol__title">{label}</div>
            <div className="selector-rol__description">{descripcion}</div>
          </button>
        );
      })}
    </div>
  );
}
