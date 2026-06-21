import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { navigate, toast, auth, authSvc } = vi.hoisted(() => ({
  navigate: vi.fn(),
  toast: { mostrarExito: vi.fn(), mostrarError: vi.fn() },
  auth: { login: vi.fn(), signup: vi.fn() },
  authSvc: { recuperarPassword: vi.fn() },
}));

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => auth }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => toast }));
vi.mock('@/services/auth.service', () => ({ recuperarPassword: (...a) => authSvc.recuperarPassword(...a) }));

import Login from '@/modules/identidad/pages/Login';
import Registro from '@/modules/identidad/pages/Registro';
import RecuperarPassword from '@/modules/identidad/pages/RecuperarPassword';
import SelectorRol from '@/modules/identidad/components/SelectorRol';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);
beforeEach(() => vi.clearAllMocks());

describe('Login', () => {
  it('valida el correo antes de enviar', async () => {
    wrap(<Login />);
    await userEvent.type(screen.getByLabelText(/^Correo/), 'no-es-email');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('inicia sesión y navega al panel del rol', async () => {
    auth.login.mockResolvedValue({ rol: 'jugador' });
    wrap(<Login />);
    await userEvent.type(screen.getByLabelText(/^Correo/), 'a@a.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret1');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => expect(auth.login).toHaveBeenCalledWith('a@a.cl', 'secret1'));
    expect(navigate).toHaveBeenCalledWith('/jugador', { replace: true });
    expect(toast.mostrarExito).toHaveBeenCalled();
  });

  it('muestra error cuando el login falla', async () => {
    auth.login.mockRejectedValue(new Error('Invalid login credentials'));
    wrap(<Login />);
    await userEvent.type(screen.getByLabelText(/^Correo/), 'a@a.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'mala');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('Registro', () => {
  it('muestra errores de validación con campos vacíos', async () => {
    wrap(<Registro />);
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByText('El nombre de usuario es obligatorio.')).toBeInTheDocument();
    expect(auth.signup).not.toHaveBeenCalled();
  });

  it('valida que las contraseñas coincidan', async () => {
    wrap(<Registro />);
    await userEvent.type(screen.getByLabelText(/^Nombre de usuario/), 'usuario1');
    await userEvent.type(screen.getByLabelText(/^Correo/), 'a@a.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), 'otracosa');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });

  it('muestra el campo de tienda al elegir el rol tienda', async () => {
    wrap(<Registro />);
    await userEvent.click(screen.getByRole('button', { name: /Tienda/ }));
    expect(screen.getByLabelText(/^Nombre de la tienda/)).toBeInTheDocument();
  });

  it('registra y navega al panel', async () => {
    auth.signup.mockResolvedValue({ rol: 'jugador' });
    wrap(<Registro />);
    await userEvent.type(screen.getByLabelText(/^Nombre de usuario/), 'usuario1');
    await userEvent.type(screen.getByLabelText(/^Correo/), 'a@a.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await waitFor(() => expect(auth.signup).toHaveBeenCalled());
    expect(navigate).toHaveBeenCalledWith('/jugador', { replace: true });
  });

  it('muestra pantalla de verificación de correo', async () => {
    auth.signup.mockResolvedValue({ requiresEmailVerification: true });
    wrap(<Registro />);
    await userEvent.type(screen.getByLabelText(/^Nombre de usuario/), 'usuario1');
    await userEvent.type(screen.getByLabelText(/^Correo/), 'a@a.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByText('Verifica tu correo')).toBeInTheDocument();
  });
});

describe('RecuperarPassword', () => {
  it('exige el correo', async () => {
    wrap(<RecuperarPassword />);
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));
    expect(await screen.findByText('El correo es obligatorio.')).toBeInTheDocument();
    expect(authSvc.recuperarPassword).not.toHaveBeenCalled();
  });

  it('envía el correo de recuperación', async () => {
    authSvc.recuperarPassword.mockResolvedValue(undefined);
    wrap(<RecuperarPassword />);
    await userEvent.type(screen.getByLabelText(/^Correo/), 'a@a.cl');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));
    await waitFor(() => expect(authSvc.recuperarPassword).toHaveBeenCalledWith('a@a.cl'));
    expect(toast.mostrarExito).toHaveBeenCalled();
  });

  it('notifica error si falla', async () => {
    authSvc.recuperarPassword.mockRejectedValue(new Error('boom'));
    wrap(<RecuperarPassword />);
    await userEvent.type(screen.getByLabelText(/^Correo/), 'a@a.cl');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar link' }));
    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
  });
});

describe('SelectorRol', () => {
  it('renderiza los tres roles y notifica el cambio', async () => {
    const onChange = vi.fn();
    render(<SelectorRol value="jugador" onChange={onChange} />);
    expect(screen.getByText('Jugador')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Organizador/ }));
    expect(onChange).toHaveBeenCalledWith('organizador');
  });

  it('no dispara onChange cuando está deshabilitado', async () => {
    const onChange = vi.fn();
    render(<SelectorRol value="jugador" onChange={onChange} disabled />);
    await userEvent.click(screen.getByRole('button', { name: /Tienda/ }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
