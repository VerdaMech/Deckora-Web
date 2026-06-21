import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const getSession = vi.fn();
const onAuthStateChange = vi.fn();
vi.mock('@/services/supabase', () => ({
  supabase: { auth: { getSession: (...a) => getSession(...a), onAuthStateChange: (...a) => onAuthStateChange(...a) } },
}));

const authService = {
  getMe: vi.fn(),
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
};
vi.mock('@/services/auth.service', () => ({
  getMe: (...a) => authService.getMe(...a),
  login: (...a) => authService.login(...a),
  signup: (...a) => authService.signup(...a),
  logout: (...a) => authService.logout(...a),
}));

import { AuthProvider, useAuth } from '@/context/AuthContext';

function Vista() {
  const { user, rol, loading, login, signup, logout } = useAuth();
  if (loading) return <p>Cargando...</p>;
  return (
    <div>
      <p>{user ? `${user.correo} (${rol})` : 'Sin sesión'}</p>
      <button onClick={() => login('a@a.cl', '123')}>login</button>
      <button onClick={() => signup({ email: 'b@b.cl' })}>signup</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

const unsubscribe = vi.fn();

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe } } });
  });

  it('inicia sin sesión cuando no hay sesión activa', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    render(<AuthProvider><Vista /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('Sin sesión')).toBeInTheDocument());
  });

  it('carga el usuario cuando hay sesión', async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
    authService.getMe.mockResolvedValue({ user: { correo: 'x@x.cl' }, rol: 'jugador' });
    render(<AuthProvider><Vista /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('x@x.cl (jugador)')).toBeInTheDocument());
  });

  it('login actualiza el usuario en el contexto', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    authService.login.mockResolvedValue({ user: { correo: 'a@a.cl' }, rol: 'organizador' });
    render(<AuthProvider><Vista /></AuthProvider>);
    await waitFor(() => screen.getByText('Sin sesión'));
    await userEvent.click(screen.getByRole('button', { name: 'login' }));
    await waitFor(() => expect(screen.getByText('a@a.cl (organizador)')).toBeInTheDocument());
  });

  it('logout limpia el estado', async () => {
    getSession.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
    authService.getMe.mockResolvedValue({ user: { correo: 'x@x.cl' }, rol: 'jugador' });
    authService.logout.mockResolvedValue(undefined);
    render(<AuthProvider><Vista /></AuthProvider>);
    await waitFor(() => screen.getByText('x@x.cl (jugador)'));
    await userEvent.click(screen.getByRole('button', { name: 'logout' }));
    await waitFor(() => expect(screen.getByText('Sin sesión')).toBeInTheDocument());
  });

  it('signup con verificación de correo no setea usuario', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    authService.signup.mockResolvedValue({ requiresEmailVerification: true });
    render(<AuthProvider><Vista /></AuthProvider>);
    await waitFor(() => screen.getByText('Sin sesión'));
    await userEvent.click(screen.getByRole('button', { name: 'signup' }));
    expect(screen.getByText('Sin sesión')).toBeInTheDocument();
  });

  it('useAuth fuera del provider lanza error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Suelto() { useAuth(); return null; }
    expect(() => render(<Suelto />)).toThrow(/AuthProvider/);
    spy.mockRestore();
  });
});
