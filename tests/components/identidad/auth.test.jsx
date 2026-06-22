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

  it('navega al panel de organizador con rol organizador', async () => {
    auth.login.mockResolvedValue({ rol: 'organizador' });
    wrap(<Login />);
    await userEvent.type(screen.getByLabelText(/^Correo/), 'org@org.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret1');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/organizador', { replace: true }));
  });

  it('navega al panel de tienda con rol tienda', async () => {
    auth.login.mockResolvedValue({ rol: 'tienda' });
    wrap(<Login />);
    await userEvent.type(screen.getByLabelText(/^Correo/), 'shop@shop.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret1');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/tienda', { replace: true }));
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

  it('valida formato invalido de nombre de usuario', async () => {
    wrap(<Registro />);
    await userEvent.type(screen.getByLabelText(/^Nombre de usuario/), 'a b');
    await userEvent.type(screen.getByLabelText(/^Correo/), 'a@a.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByText(/Solo letras, números/)).toBeInTheDocument();
    expect(auth.signup).not.toHaveBeenCalled();
  });

  it('valida contraseña demasiado corta', async () => {
    wrap(<Registro />);
    await userEvent.type(screen.getByLabelText(/^Nombre de usuario/), 'usuario1');
    await userEvent.type(screen.getByLabelText(/^Correo/), 'a@a.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), '1234');
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), '1234');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByText(/al menos 8 caracteres/)).toBeInTheDocument();
    expect(auth.signup).not.toHaveBeenCalled();
  });

  it('valida correo invalido', async () => {
    wrap(<Registro />);
    await userEvent.type(screen.getByLabelText(/^Nombre de usuario/), 'usuario1');
    await userEvent.type(screen.getByLabelText(/^Correo/), 'no-email');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByText('Ingresa un correo válido.')).toBeInTheDocument();
  });

  it('muestra error cuando signup falla', async () => {
    auth.signup.mockRejectedValue(new Error('Email already exists'));
    wrap(<Registro />);
    await userEvent.type(screen.getByLabelText(/^Nombre de usuario/), 'usuario1');
    await userEvent.type(screen.getByLabelText(/^Correo/), 'a@a.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('valida nombre de tienda obligatorio para rol tienda', async () => {
    wrap(<Registro />);
    await userEvent.click(screen.getByRole('button', { name: /Tienda/ }));
    await userEvent.type(screen.getByLabelText(/^Nombre de usuario/), 'tienda1');
    await userEvent.type(screen.getByLabelText(/^Correo/), 'a@a.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByText('El nombre de la tienda es obligatorio.')).toBeInTheDocument();
    expect(auth.signup).not.toHaveBeenCalled();
  });

  it('registra como organizador y navega al panel correcto', async () => {
    auth.signup.mockResolvedValue({ rol: 'organizador' });
    wrap(<Registro />);
    await userEvent.click(screen.getByRole('button', { name: /Organizador/ }));
    await userEvent.type(screen.getByLabelText(/^Nombre de usuario/), 'org1');
    await userEvent.type(screen.getByLabelText(/^Correo/), 'org@org.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await waitFor(() => expect(auth.signup).toHaveBeenCalled());
    expect(navigate).toHaveBeenCalledWith('/organizador', { replace: true });
  });

  it('registra como tienda y navega al panel correcto', async () => {
    auth.signup.mockResolvedValue({ rol: 'tienda' });
    wrap(<Registro />);
    await userEvent.click(screen.getByRole('button', { name: /Tienda/ }));
    await userEvent.type(screen.getByLabelText(/^Nombre de usuario/), 'shop1');
    await userEvent.type(screen.getByLabelText(/^Correo/), 'shop@shop.cl');
    await userEvent.type(screen.getByLabelText(/^Contraseña/), 'secret123');
    await userEvent.type(screen.getByLabelText(/^Confirmar contraseña/), 'secret123');
    await userEvent.type(screen.getByLabelText(/^Nombre de la tienda/), 'Mi Tienda');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await waitFor(() => expect(auth.signup).toHaveBeenCalledWith(expect.objectContaining({
      rol: 'tienda',
      nombre_tienda: 'Mi Tienda',
    })));
    expect(navigate).toHaveBeenCalledWith('/tienda', { replace: true });
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
