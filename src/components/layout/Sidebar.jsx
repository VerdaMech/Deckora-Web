import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Settings,
  Plus, ChevronLeft, ChevronRight, CalendarDays,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

const ITEMS = {
  jugador: () => [
    { to: '/jugador', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/mazos', icon: Layers, label: 'Mis mazos' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
  ],
  organizador: () => [
    { to: '/organizador', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/mis-torneos', icon: CalendarDays, label: 'Mis torneos' },
    { to: '/organizador/torneos/nuevo', icon: Plus, label: 'Crear torneo' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
  ],
  tienda: () => [
    { to: '/tienda', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/mis-torneos', icon: CalendarDays, label: 'Mis torneos' },
    { to: '/organizador/torneos/nuevo', icon: Plus, label: 'Crear torneo' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
  ],
};

export default function Sidebar() {
  const { user, rol } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const items = rol ? (ITEMS[rol]?.() ?? []) : [];

  return (
    <aside className={`sidebar-deckora${collapsed ? ' sidebar-deckora--collapsed' : ''}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <ul className="sidebar-nav">
        {items.map((item) => (
          <li key={`${item.to}-${item.label}`}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' sidebar-nav-item--active' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
