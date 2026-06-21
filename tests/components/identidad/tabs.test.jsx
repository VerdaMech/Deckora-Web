import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { navigate, toast, authState, api, torneosSvc, supa } = vi.hoisted(() => ({
  navigate: vi.fn(),
  toast: { mostrarExito: vi.fn(), mostrarError: vi.fn() },
  authState: { value: {} },
  api: { apiGet: vi.fn(), apiPatch: vi.fn(), apiDelete: vi.fn() },
  torneosSvc: {
    listarMisInscripciones: vi.fn(),
    cancelarInscripcion: vi.fn(),
    listarTorneos: vi.fn(),
    cambiarEstadoTorneo: vi.fn(),
  },
  supa: { updateUser: vi.fn() },
}));

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => toast }));
vi.mock('@/services/api', () => ({
  apiGet: (...a) => api.apiGet(...a),
  apiPatch: (...a) => api.apiPatch(...a),
  apiDelete: (...a) => api.apiDelete(...a),
  default: vi.fn(),
}));
vi.mock('@/services/torneos.service', () => ({
  listarMisInscripciones: (...a) => torneosSvc.listarMisInscripciones(...a),
  cancelarInscripcion: (...a) => torneosSvc.cancelarInscripcion(...a),
  listarTorneos: (...a) => torneosSvc.listarTorneos(...a),
  cambiarEstadoTorneo: (...a) => torneosSvc.cambiarEstadoTorneo(...a),
}));
vi.mock('@/services/supabase', () => ({ supabase: { auth: { updateUser: (...a) => supa.updateUser(...a) } } }));
vi.mock('@/components/domain/EstadisticasJugador', () => ({ default: () => <div data-testid="stats" /> }));

import ProfileHeader from '@/modules/identidad/components/ProfileHeader';
import MisEstadisticasTab from '@/modules/identidad/components/MisEstadisticasTab';
import CuentaTab from '@/modules/identidad/components/CuentaTab';
import ConfiguracionOrganizadorTab from '@/modules/identidad/components/ConfiguracionOrganizadorTab';
import MisInscripcionesTab from '@/modules/identidad/components/MisInscripcionesTab';
import MisTorneosTab from '@/modules/identidad/components/MisTorneosTab';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  authState.value = { user: { id: 1, email: 'a@a.cl' }, logout: vi.fn() };
});

describe('ProfileHeader', () => {
  it('muestra el nombre y las iniciales', () => {
    render(<ProfileHeader nombre="Ana" rol="jugador" />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('AN')).toBeInTheDocument();
  });
});

describe('MisEstadisticasTab', () => {
  it('renderiza el título y el componente de stats', () => {
    render(<MisEstadisticasTab usuarioId={1} />);
    expect(screen.getByText('Mis estadísticas')).toBeInTheDocument();
    expect(screen.getByTestId('stats')).toBeInTheDocument();
  });
});

describe('CuentaTab', () => {
  it('muestra el correo actual', () => {
    render(<CuentaTab />);
    expect(screen.getByText(/a@a.cl/)).toBeInTheDocument();
  });

  it('valida que las contraseñas coincidan', async () => {
    render(<CuentaTab />);
    await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'abcdef');
    await userEvent.type(screen.getByLabelText('Confirmar nueva contraseña'), 'xxxxxx');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    expect(supa.updateUser).not.toHaveBeenCalled();
  });

  it('guarda la nueva contraseña vía supabase', async () => {
    supa.updateUser.mockResolvedValue({ error: null });
    render(<CuentaTab />);
    await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'abcdef');
    await userEvent.type(screen.getByLabelText('Confirmar nueva contraseña'), 'abcdef');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(supa.updateUser).toHaveBeenCalledWith({ password: 'abcdef' }));
    expect(toast.mostrarExito).toHaveBeenCalled();
  });

  it('elimina la cuenta tras confirmar con el texto requerido', async () => {
    api.apiDelete.mockResolvedValue(null);
    const logout = vi.fn();
    authState.value = { user: { id: 1, email: 'a@a.cl' }, logout };
    render(<CuentaTab />);
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar mi cuenta' }));
    fireEvent.change(await screen.findByPlaceholderText('ELIMINAR'), { target: { value: 'ELIMINAR' } });
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }));
    await waitFor(() => expect(api.apiDelete).toHaveBeenCalledWith('/auth/me'));
    expect(logout).toHaveBeenCalled();
  });

  it('valida que la contraseña tenga al menos 6 caracteres', async () => {
    render(<CuentaTab />);
    await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'abc');
    await userEvent.type(screen.getByLabelText('Confirmar nueva contraseña'), 'abc');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeInTheDocument();
    expect(supa.updateUser).not.toHaveBeenCalled();
  });

  it('muestra error cuando no hay cambios para guardar', async () => {
    render(<CuentaTab />);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(screen.getByText('No hay cambios para guardar.')).toBeInTheDocument();
    expect(supa.updateUser).not.toHaveBeenCalled();
  });

  it('muestra error cuando supabase falla al actualizar', async () => {
    supa.updateUser.mockResolvedValue({ error: { message: 'Token expired' } });
    render(<CuentaTab />);
    await userEvent.type(screen.getByLabelText('Nueva contraseña'), 'abcdefgh');
    await userEvent.type(screen.getByLabelText('Confirmar nueva contraseña'), 'abcdefgh');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
  });

  it('permite cambiar el correo electrónico', async () => {
    supa.updateUser.mockResolvedValue({ error: null });
    render(<CuentaTab />);
    await userEvent.type(screen.getByLabelText('Nuevo correo'), 'nuevo@test.cl');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(supa.updateUser).toHaveBeenCalledWith({ email: 'nuevo@test.cl' }));
    expect(toast.mostrarExito).toHaveBeenCalled();
  });

  it('muestra error cuando falla la eliminación de la cuenta', async () => {
    api.apiDelete.mockRejectedValue(new Error('Server error'));
    const logout = vi.fn();
    authState.value = { user: { id: 1, email: 'a@a.cl' }, logout };
    render(<CuentaTab />);
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar mi cuenta' }));
    fireEvent.change(await screen.findByPlaceholderText('ELIMINAR'), { target: { value: 'ELIMINAR' } });
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar definitivamente' }));
    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
    expect(logout).not.toHaveBeenCalled();
  });
});

describe('ConfiguracionOrganizadorTab', () => {
  it('carga los datos y guarda los cambios', async () => {
    api.apiGet.mockResolvedValue({ descripcion: 'Hola', sitio_web: 'https://x.cl' });
    api.apiPatch.mockResolvedValue({});
    render(<ConfiguracionOrganizadorTab />);
    await waitFor(() => expect(screen.getByDisplayValue('Hola')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(api.apiPatch).toHaveBeenCalledWith('/organizadores/me', expect.any(Object)));
    expect(toast.mostrarExito).toHaveBeenCalled();
  });

  it('notifica error si falla el guardado', async () => {
    api.apiGet.mockResolvedValue({ descripcion: '', sitio_web: '' });
    api.apiPatch.mockRejectedValue(new Error('boom'));
    render(<ConfiguracionOrganizadorTab />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
  });
});

describe('MisInscripcionesTab', () => {
  it('muestra empty state cuando no hay inscripciones', async () => {
    torneosSvc.listarMisInscripciones.mockResolvedValue([]);
    wrap(<MisInscripcionesTab />);
    await waitFor(() => expect(screen.getByText('No estás inscrito en torneos próximos')).toBeInTheDocument());
  });

  it('lista inscripciones y permite cancelar', async () => {
    torneosSvc.listarMisInscripciones.mockResolvedValue([
      { torneo: { id: 5, nombre: 'Liga', estado: 'pendiente' }, inscripcion: { id: 9, mazo: { nombre: 'Atraxa' } } },
    ]);
    torneosSvc.cancelarInscripcion.mockResolvedValue(null);
    wrap(<MisInscripcionesTab />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar inscripción' }));
    await waitFor(() => expect(torneosSvc.cancelarInscripcion).toHaveBeenCalledWith(5, 9));
    expect(toast.mostrarExito).toHaveBeenCalled();
  });

  it('oculta el botón cancelar si el torneo está finalizado', async () => {
    torneosSvc.listarMisInscripciones.mockResolvedValue([
      { torneo: { id: 10, nombre: 'Torneo Final', estado: 'finalizado' }, inscripcion: { id: 20, mazo: null } },
    ]);
    wrap(<MisInscripcionesTab />);
    await waitFor(() => expect(screen.getByText('Torneo Final')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Cancelar inscripción' })).not.toBeInTheDocument();
  });

  it('oculta el botón cancelar si el torneo está cancelado', async () => {
    torneosSvc.listarMisInscripciones.mockResolvedValue([
      { torneo: { id: 11, nombre: 'Torneo Anulado', estado: 'cancelado' }, inscripcion: { id: 21, mazo: null } },
    ]);
    wrap(<MisInscripcionesTab />);
    await waitFor(() => expect(screen.getByText('Torneo Anulado')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Cancelar inscripción' })).not.toBeInTheDocument();
  });

  it('muestra alerta de error cuando falla la carga', async () => {
    torneosSvc.listarMisInscripciones.mockRejectedValue(new Error('Conexión perdida'));
    wrap(<MisInscripcionesTab />);
    await waitFor(() => expect(screen.getByText('Conexión perdida')).toBeInTheDocument());
  });

  it('normaliza datos cuando el item no tiene .torneo', async () => {
    torneosSvc.listarMisInscripciones.mockResolvedValue([
      { id: 30, nombre: 'Liga Directa', estado: 'pendiente' },
    ]);
    wrap(<MisInscripcionesTab />);
    await waitFor(() => expect(screen.getByText('Liga Directa')).toBeInTheDocument());
    expect(screen.getByText('Inscrito')).toBeInTheDocument();
  });

  it('muestra el nombre del mazo cuando está presente', async () => {
    torneosSvc.listarMisInscripciones.mockResolvedValue([
      { torneo: { id: 5, nombre: 'Liga', estado: 'pendiente' }, inscripcion: { id: 9, mazo: { nombre: 'Atraxa' } } },
    ]);
    wrap(<MisInscripcionesTab />);
    await waitFor(() => expect(screen.getByText('Mazo: Atraxa')).toBeInTheDocument());
  });

  it('muestra error y toast cuando falla la cancelación', async () => {
    torneosSvc.listarMisInscripciones.mockResolvedValue([
      { torneo: { id: 5, nombre: 'Liga', estado: 'pendiente' }, inscripcion: { id: 9, mazo: null } },
    ]);
    torneosSvc.cancelarInscripcion.mockRejectedValue(new Error('No autorizado'));
    wrap(<MisInscripcionesTab />);
    await waitFor(() => expect(screen.getByText('Liga')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar inscripción' }));
    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
  });
});

describe('MisTorneosTab', () => {
  it('muestra empty state sin torneos propios', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([]);
    wrap(<MisTorneosTab />);
    await waitFor(() => expect(screen.getByText('No has creado torneos todavía')).toBeInTheDocument());
  });

  it('lista torneos propios y cancela con confirmación', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([{ id: 7, nombre: 'Mi Liga', estado: 'pendiente', organizador_id: 1 }]);
    torneosSvc.cambiarEstadoTorneo.mockResolvedValue({});
    wrap(<MisTorneosTab />);
    await waitFor(() => expect(screen.getByText('Mi Liga')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar cancelación' }));
    await waitFor(() => expect(torneosSvc.cambiarEstadoTorneo).toHaveBeenCalledWith(7, 'cancelado'));
  });

  it('navega a editar al pulsar Editar', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([{ id: 7, nombre: 'Mi Liga', estado: 'pendiente', organizador_id: 1 }]);
    wrap(<MisTorneosTab />);
    await waitFor(() => expect(screen.getByText('Mi Liga')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(navigate).toHaveBeenCalledWith('/organizador/torneos/7/editar');
  });

  it('navega a gestionar al pulsar Gestionar', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([{ id: 7, nombre: 'Mi Liga', estado: 'pendiente', organizador_id: 1 }]);
    wrap(<MisTorneosTab />);
    await waitFor(() => expect(screen.getByText('Mi Liga')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Gestionar' }));
    expect(navigate).toHaveBeenCalledWith('/organizador/torneos/7/gestion');
  });

  it('muestra error y botón reintentar cuando falla la carga', async () => {
    torneosSvc.listarTorneos.mockRejectedValue(new Error('Error de red'));
    wrap(<MisTorneosTab />);
    await waitFor(() => expect(screen.getByText(/Error de red/)).toBeInTheDocument());
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('oculta botón cancelar si el torneo está finalizado', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([{ id: 8, nombre: 'Torneo Cerrado', estado: 'finalizado', organizador_id: 1 }]);
    wrap(<MisTorneosTab />);
    await waitFor(() => expect(screen.getByText('Torneo Cerrado')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gestionar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });

  it('oculta botón cancelar si el torneo está cancelado', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([{ id: 9, nombre: 'Torneo Anulado', estado: 'cancelado', organizador_id: 1 }]);
    wrap(<MisTorneosTab />);
    await waitFor(() => expect(screen.getByText('Torneo Anulado')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
  });

  it('navega a crear torneo nuevo desde el botón superior', async () => {
    torneosSvc.listarTorneos.mockResolvedValue([{ id: 7, nombre: 'Mi Liga', estado: 'pendiente', organizador_id: 1 }]);
    wrap(<MisTorneosTab />);
    await waitFor(() => expect(screen.getByText('Mi Liga')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Crear torneo nuevo' }));
    expect(navigate).toHaveBeenCalledWith('/organizador/torneos/nuevo');
  });
});
