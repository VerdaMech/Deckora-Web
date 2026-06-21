import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { getRecomendaciones, importarMazo } = vi.hoisted(() => ({ getRecomendaciones: vi.fn(), importarMazo: vi.fn() }));
vi.mock('@/services/mazos.service', () => ({
  getRecomendaciones: (...a) => getRecomendaciones(...a),
  importarMazo: (...a) => importarMazo(...a),
}));

import { AsistenteIA } from '@/modules/mazos/components/AsistenteIA';

const mazo = { id: 1, formato: 'COMMANDER' };
const cartasNoVacio = [{ id: 1, cantidad: 1 }];

beforeEach(() => vi.clearAllMocks());

describe('AsistenteIA', () => {
  it('pide recomendaciones y las muestra', async () => {
    getRecomendaciones.mockResolvedValue({
      recomendaciones: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact', costo_mana: '{1}' }],
      explicacion: 'Mejora tu rampa **Sol Ring**',
    });
    render(<AsistenteIA mazo={mazo} cartas={cartasNoVacio} onAplicarSugerencia={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /pedir recomendaciones/i }));
    await waitFor(() => expect(screen.getAllByText('Sol Ring').length).toBeGreaterThan(0));
  });

  it('aplica una sugerencia al mazo', async () => {
    getRecomendaciones.mockResolvedValue({ recomendaciones: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact' }] });
    const onAplicarSugerencia = vi.fn();
    render(<AsistenteIA mazo={mazo} cartas={cartasNoVacio} onAplicarSugerencia={onAplicarSugerencia} />);
    await userEvent.click(screen.getByRole('button', { name: /pedir recomendaciones/i }));
    await userEvent.click(await screen.findByRole('button', { name: /agregar al mazo/i }));
    expect(onAplicarSugerencia).toHaveBeenCalled();
  });

  it('muestra error si fallan las recomendaciones', async () => {
    getRecomendaciones.mockRejectedValue(new Error('IA caída'));
    render(<AsistenteIA mazo={mazo} cartas={cartasNoVacio} onAplicarSugerencia={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /pedir recomendaciones/i }));
    await waitFor(() => expect(screen.getByText('IA caída')).toBeInTheDocument());
  });

  it('autocompleta llamando al callback cuando el mazo no está vacío', async () => {
    const onAutocompletar = vi.fn().mockResolvedValue(undefined);
    render(<AsistenteIA mazo={mazo} cartas={cartasNoVacio} onAutocompletar={onAutocompletar} />);
    await userEvent.click(screen.getByRole('button', { name: /autocompletar con ia/i }));
    await waitFor(() => expect(onAutocompletar).toHaveBeenCalled());
    expect(await screen.findByText('Mazo completado con éxito.')).toBeInTheDocument();
  });
});
