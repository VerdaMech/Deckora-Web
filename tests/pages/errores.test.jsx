import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { authState } = vi.hoisted(() => ({ authState: { value: {} } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));

const logoutService = vi.fn();
vi.mock('@/services/auth.service', () => ({ logout: (...a) => logoutService(...a) }));

import NotFound from '@/pages/NotFound';
import Forbidden from '@/pages/Forbidden';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => { authState.value = { user: null, rol: null }; vi.clearAllMocks(); });

describe('NotFound', () => {
  it('muestra el mensaje 404 y enlaces para invitado', () => {
    wrap(<NotFound />);
    expect(screen.getByText(/no está en el grimorio/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('muestra "Mi panel" según el rol cuando hay usuario', () => {
    authState.value = { user: { id: 1 }, rol: 'organizador' };
    wrap(<NotFound />);
    const panel = screen.getByRole('link', { name: 'Mi panel' });
    expect(panel).toHaveAttribute('href', '/organizador');
  });
});

describe('Forbidden', () => {
  it('muestra el mensaje 403', () => {
    wrap(<Forbidden />);
    expect(screen.getByText(/no puedes cruzar este umbral/i)).toBeInTheDocument();
  });

  it('cierra sesión y redirige cuando hay usuario', async () => {
    const original = window.location;
    delete window.location;
    window.location = { href: '' };
    logoutService.mockResolvedValue(undefined);
    authState.value = { user: { id: 1 } };
    wrap(<Forbidden />);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(logoutService).toHaveBeenCalled();
    window.location = original;
  });
});
