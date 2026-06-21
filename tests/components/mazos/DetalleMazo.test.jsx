import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const { navigate, toast, mazosSvc } = vi.hoisted(() => ({
  navigate: vi.fn(),
  toast: { mostrarExito: vi.fn(), mostrarError: vi.fn() },
  mazosSvc: { obtenerMazo: vi.fn(), validarMazo: vi.fn(), actualizarMazo: vi.fn() },
}));

vi.mock('react-router-dom', async (orig) => ({
  ...(await orig()),
  useNavigate: () => navigate,
  useParams: () => ({ id: '1' }),
}));
vi.mock('@/context/ToastContext', () => ({ useToast: () => toast }));
vi.mock('@/services/mazos.service', () => ({
  obtenerMazo: (...a) => mazosSvc.obtenerMazo(...a),
  validarMazo: (...a) => mazosSvc.validarMazo(...a),
  actualizarMazo: (...a) => mazosSvc.actualizarMazo(...a),
}));
vi.mock('@/modules/mazos/components/ModoEdicionMazo', () => ({
  ModoEdicionMazo: ({ onSalir }) => <button onClick={onSalir}>Salir edición stub</button>,
}));

import DetalleMazo from '@/modules/mazos/pages/DetalleMazo';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  vi.clearAllMocks();
  mazosSvc.validarMazo.mockResolvedValue({ valido: true, reglas: [], advertencias: [] });
});

describe('DetalleMazo', () => {
  it('muestra el detalle con lista y estadísticas', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Atraxa', formato: 'COMMANDER',
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'Llanowar Elves', tipo: 'Creature — Elf' } }],
    });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Atraxa')).toBeInTheDocument());
    expect(screen.getByText('Criaturas')).toBeInTheDocument();
  });

  it('muestra empty state cuando el mazo no tiene cartas', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({ id: 1, nombre: 'Vacío', formato: 'COMMANDER', cartas: [] });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Tu mazo está vacío')).toBeInTheDocument());
  });

  it('muestra error al fallar la carga', async () => {
    mazosSvc.obtenerMazo.mockRejectedValue(new Error('no existe'));
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('no existe')).toBeInTheDocument());
  });

  it('entra en modo edición desde el empty state', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({ id: 1, nombre: 'Vacío', formato: 'COMMANDER', cartas: [] });
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Tu mazo está vacío')).toBeInTheDocument());
    // El header y el empty state comparten el nombre accesible "Editar mazo"
    await userEvent.click(screen.getAllByRole('button', { name: 'Editar mazo' })[0]);
    expect(screen.getByText('Salir edición stub')).toBeInTheDocument();
  });

  it('guarda los cambios de metadata', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Atraxa', formato: 'COMMANDER',
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'X', tipo: 'Creature' } }],
    });
    mazosSvc.actualizarMazo.mockResolvedValue({});
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Atraxa')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Editar mazo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(mazosSvc.actualizarMazo).toHaveBeenCalled());
    expect(toast.mostrarExito).toHaveBeenCalled();
  });

  it('notifica error si falla el guardado de metadata', async () => {
    mazosSvc.obtenerMazo.mockResolvedValue({
      id: 1, nombre: 'Atraxa', formato: 'COMMANDER',
      cartas: [{ id: 1, scryfallId: 's1', cantidad: 1, esComandante: false, carta: { nombre: 'X', tipo: 'Creature' } }],
    });
    mazosSvc.actualizarMazo.mockRejectedValue(new Error('falló guardar'));
    wrap(<DetalleMazo />);
    await waitFor(() => expect(screen.getByText('Atraxa')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Editar mazo' }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(toast.mostrarError).toHaveBeenCalled());
  });
});
