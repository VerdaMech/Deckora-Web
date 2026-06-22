import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/components/domain/MapaTiendas', () => ({ default: ({ tiendas }) => <div data-testid="mapa" data-count={tiendas.length} /> }));

const listarTiendas = vi.fn();
vi.mock('@/services/tiendas.service', () => ({ listarTiendas: (...a) => listarTiendas(...a) }));

import SeccionMapaTiendas from '@/modules/mapa/components/SeccionMapaTiendas';

describe('SeccionMapaTiendas', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra spinner mientras carga', () => {
    listarTiendas.mockReturnValue(new Promise(() => {}));
    render(<SeccionMapaTiendas />);
    expect(screen.getByText(/cargando mapa de tiendas/i)).toBeInTheDocument();
  });

  it('renderiza el mapa con las tiendas cargadas', async () => {
    listarTiendas.mockResolvedValue({ data: [{ id: 1 }, { id: 2 }], error: null });
    render(<SeccionMapaTiendas />);
    await waitFor(() => expect(screen.getByTestId('mapa')).toBeInTheDocument());
    expect(screen.getByTestId('mapa')).toHaveAttribute('data-count', '2');
    expect(screen.getByText('2 tiendas registradas')).toBeInTheDocument();
  });

  it('muestra error y permite reintentar', async () => {
    listarTiendas.mockResolvedValue({ data: null, error: 'sin red' });
    render(<SeccionMapaTiendas />);
    await waitFor(() => expect(screen.getByText(/no se pudieron cargar las tiendas/i)).toBeInTheDocument());
    listarTiendas.mockResolvedValue({ data: [{ id: 1 }], error: null });
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByTestId('mapa')).toBeInTheDocument());
  });
});
