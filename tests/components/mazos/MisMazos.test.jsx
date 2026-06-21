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
});
