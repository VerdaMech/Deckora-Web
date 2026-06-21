import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { navigate, toast, mazosSvc } = vi.hoisted(() => ({
  navigate: vi.fn(),
  toast: { mostrarExito: vi.fn(), mostrarError: vi.fn() },
  mazosSvc: { listarMisMazos: vi.fn(), eliminarMazo: vi.fn(), crearMazo: vi.fn() },
}));

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@/context/ToastContext', () => ({ useToast: () => toast }));
vi.mock('@/services/mazos.service', () => ({
  listarMisMazos: (...a) => mazosSvc.listarMisMazos(...a),
  eliminarMazo: (...a) => mazosSvc.eliminarMazo(...a),
  crearMazo: (...a) => mazosSvc.crearMazo(...a),
}));

import MisMazos from '@/modules/mazos/pages/MisMazos';
import { CrearMazoModal } from '@/modules/mazos/pages/CrearMazoModal';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);
beforeEach(() => vi.clearAllMocks());

describe('MisMazos', () => {
  it('muestra empty state cuando no hay mazos', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([]);
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Aún no tienes mazos')).toBeInTheDocument());
  });

  it('lista los mazos del usuario', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([{ id: 1, nombre: 'Atraxa', formato: 'COMMANDER', total_cartas: 100 }]);
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Atraxa')).toBeInTheDocument());
    expect(screen.getByText('100 cartas')).toBeInTheDocument();
  });

  it('muestra error con opción de reintentar', async () => {
    mazosSvc.listarMisMazos.mockRejectedValue(new Error('falló'));
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('falló')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('elimina un mazo tras confirmar', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([{ id: 5, nombre: 'Krenko', formato: 'COMMANDER' }]);
    mazosSvc.eliminarMazo.mockResolvedValue(null);
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Krenko')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar mazo Krenko' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(mazosSvc.eliminarMazo).toHaveBeenCalledWith(5));
  });

  it('muestra mazo con comandante como string', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([
      { id: 10, nombre: 'Atraxa Superfriends', formato: 'COMMANDER', total_cartas: 100, comandante: 'Atraxa, Praetors Voice' },
    ]);
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Atraxa Superfriends')).toBeInTheDocument());
    expect(screen.getByText('Atraxa, Praetors Voice')).toBeInTheDocument();
  });

  it('muestra mazo con comandante como objeto', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([
      { id: 11, nombre: 'Krenko Goblins', formato: 'COMMANDER', total_cartas: 100, comandante: { name: 'Krenko, Mob Boss' } },
    ]);
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Krenko Goblins')).toBeInTheDocument());
    expect(screen.getByText('Krenko, Mob Boss')).toBeInTheDocument();
  });

  it('muestra fecha relativa cuando el mazo tiene updated_at', async () => {
    const recentDate = new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(); // 2 hours ago
    mazosSvc.listarMisMazos.mockResolvedValue([
      { id: 12, nombre: 'Mazo Reciente', formato: 'STANDARD', total_cartas: 60, updated_at: recentDate },
    ]);
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Mazo Reciente')).toBeInTheDocument());
    expect(screen.getByText(/hace 2 h/)).toBeInTheDocument();
  });

  it('navega al detalle al hacer clic en una carta', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([
      { id: 7, nombre: 'Mazo Click', formato: 'COMMANDER', total_cartas: 99 },
    ]);
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Mazo Click')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Ver mazo Mazo Click' }));
    expect(navigate).toHaveBeenCalledWith('/mazos/7');
  });

  it('muestra singular "carta" cuando hay exactamente 1', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([
      { id: 13, nombre: 'Mazo Uno', formato: 'COMMANDER', total_cartas: 1 },
    ]);
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Mazo Uno')).toBeInTheDocument());
    expect(screen.getByText('1 carta')).toBeInTheDocument();
  });

  it('abre el modal de crear mazo al hacer clic en el botón', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([]);
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Aún no tienes mazos')).toBeInTheDocument());
    // Click the "Crear mazo" button in the empty state
    const crearBtns = screen.getAllByRole('button', { name: /Crear mazo/ });
    await userEvent.click(crearBtns[0]);
    // The CrearMazoModal should now be visible
    await waitFor(() => expect(screen.getByLabelText(/^Nombre/)).toBeInTheDocument());
  });

  it('muestra error cuando falla eliminarMazo', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([{ id: 5, nombre: 'Krenko', formato: 'COMMANDER' }]);
    mazosSvc.eliminarMazo.mockRejectedValue(new Error('No se pudo eliminar'));
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Krenko')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar mazo Krenko' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(screen.getByText('No se pudo eliminar el mazo. Intenta de nuevo.')).toBeInTheDocument());
  });

  it('reintenta la carga al hacer clic en Reintentar', async () => {
    mazosSvc.listarMisMazos.mockRejectedValueOnce(new Error('Error de red'));
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Error de red')).toBeInTheDocument());
    mazosSvc.listarMisMazos.mockResolvedValueOnce([{ id: 1, nombre: 'Recuperado', formato: 'COMMANDER', total_cartas: 10 }]);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByText('Recuperado')).toBeInTheDocument());
  });

  it('cancela eliminación al hacer clic en Cancelar del modal', async () => {
    mazosSvc.listarMisMazos.mockResolvedValue([{ id: 5, nombre: 'Krenko', formato: 'COMMANDER' }]);
    wrap(<MisMazos />);
    await waitFor(() => expect(screen.getByText('Krenko')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar mazo Krenko' }));
    await waitFor(() => expect(screen.getByText(/Vas a eliminar/)).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    // Modal should close, mazo should still be visible
    await waitFor(() => expect(screen.queryByText(/Vas a eliminar/)).not.toBeInTheDocument());
    expect(screen.getByText('Krenko')).toBeInTheDocument();
  });
});

describe('CrearMazoModal', () => {
  it('valida que el nombre sea obligatorio', async () => {
    wrap(<CrearMazoModal show onHide={vi.fn()} onCreado={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Crear mazo' }));
    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(mazosSvc.crearMazo).not.toHaveBeenCalled();
  });

  it('crea el mazo y navega al detalle', async () => {
    mazosSvc.crearMazo.mockResolvedValue({ id: 42 });
    const onCreado = vi.fn();
    wrap(<CrearMazoModal show onHide={vi.fn()} onCreado={onCreado} />);
    await userEvent.type(screen.getByLabelText(/^Nombre/), 'Nuevo Mazo');
    await userEvent.click(screen.getByRole('button', { name: 'Crear mazo' }));
    await waitFor(() => expect(mazosSvc.crearMazo).toHaveBeenCalled());
    expect(navigate).toHaveBeenCalledWith('/mazos/42');
    expect(onCreado).toHaveBeenCalled();
  });

  it('permite alternar el checkbox Mazo público', async () => {
    wrap(<CrearMazoModal show onHide={vi.fn()} onCreado={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.checked).toBe(false);
    await userEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    await userEvent.click(checkbox);
    expect(checkbox.checked).toBe(false);
  });

  it('permite escribir una descripción', async () => {
    wrap(<CrearMazoModal show onHide={vi.fn()} onCreado={vi.fn()} />);
    const textarea = screen.getByPlaceholderText('Descripción opcional del mazo...');
    await userEvent.type(textarea, 'Mi descripcion de mazo');
    expect(textarea.value).toBe('Mi descripcion de mazo');
  });

  it('llama a onHide al cancelar', async () => {
    const onHide = vi.fn();
    wrap(<CrearMazoModal show onHide={onHide} onCreado={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onHide).toHaveBeenCalled();
  });

  it('envía descripción y público al crear', async () => {
    mazosSvc.crearMazo.mockResolvedValue({ id: 99 });
    const onCreado = vi.fn();
    wrap(<CrearMazoModal show onHide={vi.fn()} onCreado={onCreado} />);

    await userEvent.type(screen.getByLabelText(/^Nombre/), 'Mazo Publico');
    await userEvent.type(screen.getByPlaceholderText('Descripción opcional del mazo...'), 'Una desc');
    await userEvent.click(screen.getByRole('checkbox'));
    await userEvent.click(screen.getByRole('button', { name: 'Crear mazo' }));

    await waitFor(() => expect(mazosSvc.crearMazo).toHaveBeenCalledWith(expect.objectContaining({
      nombre: 'Mazo Publico',
      descripcion: 'Una desc',
      publico: true,
    })));
  });
});
