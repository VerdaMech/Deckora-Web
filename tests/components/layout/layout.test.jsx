import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const { authState } = vi.hoisted(() => ({ authState: { value: {} } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));

import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import AppLayout from '@/components/layout/AppLayout';

function wrap(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

beforeEach(() => { authState.value = { user: null, rol: null, logout: vi.fn() }; });

describe('Footer', () => {
  it('renderiza el crédito del equipo', () => {
    render(<Footer />);
    expect(screen.getByText(/Deckora/)).toBeInTheDocument();
  });
});

describe('Sidebar', () => {
  it('muestra los items del rol jugador', () => {
    authState.value = { rol: 'jugador' };
    wrap(<Sidebar />);
    expect(screen.getByText('Mis mazos')).toBeInTheDocument();
    expect(screen.getByText('Biblioteca')).toBeInTheDocument();
  });

  it('muestra items de organizador', () => {
    authState.value = { rol: 'organizador' };
    wrap(<Sidebar />);
    expect(screen.getByText('Crear torneo')).toBeInTheDocument();
  });

  it('colapsa al pulsar el botón', async () => {
    authState.value = { rol: 'jugador' };
    const { container } = wrap(<Sidebar />);
    await userEvent.click(screen.getByLabelText('Colapsar sidebar'));
    expect(container.querySelector('.sidebar-deckora--collapsed')).toBeInTheDocument();
  });

  it('sin rol no muestra items', () => {
    authState.value = { rol: null };
    const { container } = wrap(<Sidebar />);
    expect(container.querySelectorAll('.sidebar-nav-item')).toHaveLength(0);
  });
});

describe('Navbar', () => {
  it('muestra accesos de invitado cuando no hay usuario', () => {
    authState.value = { user: null, rol: null, logout: vi.fn() };
    wrap(<Navbar />);
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument();
  });

  it('muestra el avatar y permite cerrar sesión cuando hay usuario', async () => {
    const logout = vi.fn();
    authState.value = { user: { nombre_usuario: 'ana' }, rol: 'jugador', logout };
    wrap(<Navbar />);
    await userEvent.click(screen.getByText('AN'));
    await userEvent.click(await screen.findByText('Cerrar sesión'));
    expect(logout).toHaveBeenCalled();
  });

  it('abre el menú offcanvas con enlaces de navegación', async () => {
    authState.value = { user: { nombre_usuario: 'ana' }, rol: 'jugador', logout: vi.fn() };
    render(
      <MemoryRouter initialEntries={['/torneos']}>
        <Navbar />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Menú' }));
    expect(await screen.findByRole('link', { name: 'Mis mazos' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Configuración' }).length).toBeGreaterThan(0);
  });
});

describe('AppLayout', () => {
  function renderLayout(props) {
    return render(
      <MemoryRouter>
        <Routes>
          <Route element={<AppLayout {...props} />}>
            <Route index element={<p>Contenido de la página</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  }

  it('renderiza navbar, footer y el contenido del Outlet', () => {
    authState.value = { user: null };
    renderLayout();
    expect(screen.getByText('Contenido de la página')).toBeInTheDocument();
    expect(screen.getByText(/Deckora/)).toBeInTheDocument();
  });

  it('muestra el sidebar cuando withSidebar y hay usuario', () => {
    authState.value = { user: { nombre_usuario: 'x' }, rol: 'jugador' };
    const { container } = renderLayout({ withSidebar: true });
    expect(container.querySelector('.sidebar-deckora')).toBeInTheDocument();
  });

  it('oculta el sidebar si no hay usuario', () => {
    authState.value = { user: null, rol: null };
    const { container } = renderLayout({ withSidebar: true });
    expect(container.querySelector('.sidebar-deckora')).toBeNull();
  });
});
