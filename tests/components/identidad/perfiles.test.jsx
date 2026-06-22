import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const { authState, api, usuariosSvc } = vi.hoisted(() => ({
  authState: { value: {} },
  api: { apiGet: vi.fn() },
  usuariosSvc: { obtenerPerfilPublico: vi.fn(), obtenerTorneosDeUsuario: vi.fn() },
}));

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));
vi.mock('@/services/api', () => ({ apiGet: (...a) => api.apiGet(...a), default: vi.fn() }));
vi.mock('@/services/usuarios.service', () => ({
  obtenerPerfilPublico: (...a) => usuariosSvc.obtenerPerfilPublico(...a),
  obtenerTorneosDeUsuario: (...a) => usuariosSvc.obtenerTorneosDeUsuario(...a),
}));
// Hijos pesados stubbeados
vi.mock('@/components/domain/EstadisticasJugador', () => ({ default: () => <div data-testid="stats" /> }));
vi.mock('@/components/domain/MiniMapaTienda', () => ({ default: () => <div data-testid="mini-mapa" /> }));
vi.mock('@/modules/identidad/components/MisInscripcionesTab', () => ({ default: () => <div data-testid="inscripciones" /> }));
vi.mock('@/modules/identidad/components/MisEstadisticasTab', () => ({ default: () => <div data-testid="mis-stats" /> }));
vi.mock('@/modules/identidad/components/MisTorneosTab', () => ({ default: () => <div data-testid="mis-torneos" /> }));
vi.mock('@/modules/identidad/components/CuentaTab', () => ({ default: () => <div data-testid="cuenta" /> }));
vi.mock('@/modules/identidad/components/ConfiguracionOrganizadorTab', () => ({ default: () => <div data-testid="config-org" /> }));
vi.mock('@/modules/identidad/components/ConfiguracionTiendaTab', () => ({ default: () => <div data-testid="config-tienda" /> }));

import Configuracion from '@/modules/identidad/pages/Configuracion';
import PerfilRouter from '@/modules/identidad/pages/PerfilRouter';
import PerfilJugador from '@/modules/identidad/pages/PerfilJugador';
import PerfilOrganizador from '@/modules/identidad/pages/PerfilOrganizador';
import PerfilTienda from '@/modules/identidad/pages/PerfilTienda';

beforeEach(() => {
  vi.clearAllMocks();
  authState.value = { user: { id: 1 }, rol: 'jugador' };
  api.apiGet.mockResolvedValue([]);
  usuariosSvc.obtenerTorneosDeUsuario.mockResolvedValue([]);
});

describe('Configuracion', () => {
  it('muestra la pestaña de cuenta por defecto', () => {
    authState.value = { rol: 'jugador' };
    render(<MemoryRouter><Configuracion /></MemoryRouter>);
    expect(screen.getByRole('tab', { name: 'Cuenta' })).toBeInTheDocument();
    expect(screen.getByTestId('cuenta')).toBeInTheDocument();
  });

  it('muestra la pestaña de organización para rol organizador', () => {
    authState.value = { rol: 'organizador' };
    render(<MemoryRouter><Configuracion /></MemoryRouter>);
    expect(screen.getByRole('tab', { name: 'Mi organización' })).toBeInTheDocument();
  });

  it('activa la pestaña de tienda según el query param', async () => {
    authState.value = { rol: 'tienda' };
    render(<MemoryRouter initialEntries={['/configuracion?tab=tienda']}><Configuracion /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('config-tienda')).toBeInTheDocument());
  });
});

describe('PerfilRouter', () => {
  function renderRouter() {
    return render(
      <MemoryRouter initialEntries={['/u/ana']}>
        <Routes>
          <Route path="/u/:username" element={<PerfilRouter />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('muestra spinner mientras carga', () => {
    usuariosSvc.obtenerPerfilPublico.mockReturnValue(new Promise(() => {}));
    renderRouter();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renderiza el perfil de jugador', async () => {
    usuariosSvc.obtenerPerfilPublico.mockResolvedValue({ id: 2, rol: 'jugador', nombre_usuario: 'ana' });
    renderRouter();
    await waitFor(() => expect(screen.getByText('ana')).toBeInTheDocument());
  });

  it('renderiza el perfil de organizador', async () => {
    usuariosSvc.obtenerPerfilPublico.mockResolvedValue({ id: 3, rol: 'organizador', nombre_usuario: 'orga' });
    usuariosSvc.obtenerTorneosDeUsuario.mockResolvedValue([]);
    renderRouter();
    await waitFor(() => expect(screen.getByText('orga')).toBeInTheDocument());
  });

  it('renderiza el perfil de tienda', async () => {
    usuariosSvc.obtenerPerfilPublico.mockResolvedValue({ id: 4, rol: 'tienda', nombre_tienda: 'Tienda Y', nombre_usuario: 'tienda_y', direccion: 'Av. Siempre Viva', latitud: -33, longitud: -70 });
    usuariosSvc.obtenerTorneosDeUsuario.mockResolvedValue([]);
    renderRouter();
    await waitFor(() => expect(screen.getByText('Tienda Y')).toBeInTheDocument());
  });

  it('muestra NotFound para un rol desconocido', async () => {
    usuariosSvc.obtenerPerfilPublico.mockResolvedValue({ id: 5, rol: 'admin', nombre_usuario: 'nobody' });
    renderRouter();
    await waitFor(() => expect(screen.getByText(/no está en el grimorio/i)).toBeInTheDocument());
  });

  it('muestra NotFound si no existe el perfil', async () => {
    usuariosSvc.obtenerPerfilPublico.mockRejectedValue(new Error('404'));
    renderRouter();
    await waitFor(() => expect(screen.getByText(/no está en el grimorio/i)).toBeInTheDocument());
  });

  it('muestra NotFound si el perfil es null', async () => {
    usuariosSvc.obtenerPerfilPublico.mockResolvedValue(null);
    renderRouter();
    await waitFor(() => expect(screen.getByText(/no está en el grimorio/i)).toBeInTheDocument());
  });
});

describe('PerfilJugador', () => {
  it('muestra el header y la sección de mazos', async () => {
    api.apiGet.mockResolvedValue([{ id: 1, nombre: 'Atraxa', formato: 'COMMANDER' }]);
    render(<MemoryRouter><PerfilJugador perfil={{ id: 2, rol: 'jugador', nombre_usuario: 'ana' }} /></MemoryRouter>);
    expect(screen.getByText('ana')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Atraxa')).toBeInTheDocument());
  });

  it('muestra las tabs de dueño cuando es el propio perfil', async () => {
    authState.value = { user: { id: 2 } };
    api.apiGet.mockResolvedValue([]);
    render(<MemoryRouter><PerfilJugador perfil={{ id: 2, rol: 'jugador', nombre_usuario: 'ana' }} /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Sin mazos públicos')).toBeInTheDocument());
    expect(screen.getByRole('tab', { name: 'Mis inscripciones' })).toBeInTheDocument();
  });
});

describe('PerfilOrganizador', () => {
  it('muestra torneos publicados', async () => {
    usuariosSvc.obtenerTorneosDeUsuario.mockResolvedValue([{ id: 1, nombre: 'Liga', formato: 'COMMANDER', fecha: '2026-01-01' }]);
    render(<MemoryRouter><PerfilOrganizador perfil={{ id: 3, rol: 'organizador', nombre_usuario: 'orga' }} /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
  });

  it('muestra empty state sin torneos', async () => {
    usuariosSvc.obtenerTorneosDeUsuario.mockResolvedValue([]);
    render(<MemoryRouter><PerfilOrganizador perfil={{ id: 3, rol: 'organizador', nombre_usuario: 'orga' }} /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Sin torneos')).toBeInTheDocument());
  });
});

describe('PerfilTienda', () => {
  it('muestra info, mapa y torneos de la tienda', async () => {
    usuariosSvc.obtenerTorneosDeUsuario.mockResolvedValue([]);
    render(
      <MemoryRouter>
        <PerfilTienda perfil={{ id: 4, rol: 'tienda', nombre_tienda: 'Tienda X', direccion: 'Calle 1', latitud: -33, longitud: -70 }} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Tienda X')).toBeInTheDocument();
    expect(screen.getByText('Calle 1')).toBeInTheDocument();
    expect(screen.getByTestId('mini-mapa')).toBeInTheDocument();
  });
});
