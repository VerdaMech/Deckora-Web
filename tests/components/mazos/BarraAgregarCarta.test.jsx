import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { buscarCartas } = vi.hoisted(() => ({ buscarCartas: vi.fn() }));
vi.mock('@/services/cartas.service', () => ({ buscarCartas: (...a) => buscarCartas(...a) }));

import { BarraAgregarCarta } from '@/modules/mazos/components/BarraAgregarCarta';

beforeEach(() => vi.clearAllMocks());

describe('BarraAgregarCarta', () => {
  it('busca cartas y muestra resultados al escribir', async () => {
    buscarCartas.mockResolvedValue([{ id: 'a', nombre: 'Sol Ring', tipo: 'Artifact' }]);
    render(<BarraAgregarCarta onAgregar={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Buscar carta'), 'sol');
    await waitFor(() => expect(buscarCartas).toHaveBeenCalledWith('sol', 20, null), { timeout: 2000 });
    expect(await screen.findByText('Sol Ring')).toBeInTheDocument();
  });

  it('agrega la carta seleccionada y limpia el query', async () => {
    buscarCartas.mockResolvedValue([{ id: 'a', nombre: 'Sol Ring', tipo: 'Artifact' }]);
    const onAgregar = vi.fn();
    render(<BarraAgregarCarta onAgregar={onAgregar} />);
    const input = screen.getByLabelText('Buscar carta');
    await userEvent.type(input, 'sol');
    const resultado = await screen.findByRole('option');
    await userEvent.click(resultado);
    expect(onAgregar).toHaveBeenCalledWith({ id: 'a', nombre: 'Sol Ring', tipo: 'Artifact' });
    expect(input).toHaveValue('');
  });

  it('muestra mensaje de error si la búsqueda falla', async () => {
    buscarCartas.mockRejectedValue(new Error('boom'));
    render(<BarraAgregarCarta onAgregar={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Buscar carta'), 'xyz');
    expect(await screen.findByText(/no pudimos buscar cartas/i)).toBeInTheDocument();
  });

  it('muestra "sin resultados" cuando no hay coincidencias', async () => {
    buscarCartas.mockResolvedValue([]);
    render(<BarraAgregarCarta onAgregar={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Buscar carta'), 'zzz');
    expect(await screen.findByText(/sin resultados para/i)).toBeInTheDocument();
  });
});
