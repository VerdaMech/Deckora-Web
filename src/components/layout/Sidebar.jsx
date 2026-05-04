import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderClosed, Layers, User, Settings,
  Plus, ChevronLeft, ChevronRight,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

const ITEMS = {
  jugador: (username) => [
    { to: '/jugador', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/colecciones', icon: FolderClosed, label: 'Mi colección' },
    { to: '/mazos', icon: Layers, label: 'Mis mazos' },
    { to: `/u/${username}`, icon: User, label: 'Mi perfil' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
  ],
  organizador: (username) => [
    { to: '/organizador', icon: LayoutDashboard, label: 'Dashboard' },
    { to: `/u/${username}`, icon: User, label: 'Mis torneos' },
    { to: '/organizador/torneos/nuevo', icon: Plus, label: 'Crear torneo' },
    { to: `/u/${username}`, icon: User, label: 'Mi perfil' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
  ],
  tienda: (username) => [
    { to: '/tienda', icon: LayoutDashboard, label: 'Dashboard' },
    { to: `/u/${username}`, icon: User, label: 'Mis torneos' },
    { to: '/organizador/torneos/nuevo', icon: Plus, label: 'Crear torneo' },
    { to: `/u/${username}`, icon: User, label: 'Mi perfil' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
  ],
};

export default function Sidebar() {
  const { user, rol } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const username = user?.nombre_usuario ?? user?.email?.split('@')[0] ?? '';
  const items = rol ? (ITEMS[rol]?.(username) ?? []) : [];

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
