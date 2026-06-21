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

  it('empty deck + available templates: autocompletar uses plantilla (importarMazo)', async () => {
    importarMazo.mockResolvedValue({});
    const onMazoImportado = vi.fn();
    // cartas=[] makes mazoVacio true; mazo.formato='COMMANDER' has templates in mazosPlantilla.json
    render(
      <AsistenteIA
        mazo={mazo}
        cartas={[]}
        onAutocompletar={vi.fn()}
        onMazoImportado={onMazoImportado}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /autocompletar con ia/i }));
    // Should call importarMazo with the mazo ID, a template lista string, and commander
    await waitFor(() => expect(importarMazo).toHaveBeenCalledWith(
      1,
      expect.any(String),
      expect.anything(),
    ));
    expect(onMazoImportado).toHaveBeenCalled();
    expect(await screen.findByText('Mazo completado con éxito.')).toBeInTheDocument();
  });

  it('"Nueva búsqueda" button clears recommendations (limpiar)', async () => {
    getRecomendaciones.mockResolvedValue({
      recomendaciones: [{ id: 1, nombre: 'Sol Ring', tipo: 'Artifact' }],
    });
    render(<AsistenteIA mazo={mazo} cartas={cartasNoVacio} onAplicarSugerencia={vi.fn()} />);
    // Get recommendations first
    await userEvent.click(screen.getByRole('button', { name: /pedir recomendaciones/i }));
    await waitFor(() => expect(screen.getAllByText('Sol Ring').length).toBeGreaterThan(0));
    // Click "Nueva búsqueda"
    await userEvent.click(screen.getByRole('button', { name: /nueva búsqueda/i }));
    // Recommendations should be cleared, back to initial state
    await waitFor(() => expect(screen.queryByText('Sol Ring')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: /pedir recomendaciones/i })).toBeInTheDocument();
  });

  it('"Volver a autocompletar" button clears autocompletar state (limpiarAutocompletar)', async () => {
    const onAutocompletar = vi.fn().mockResolvedValue(undefined);
    render(<AsistenteIA mazo={mazo} cartas={cartasNoVacio} onAutocompletar={onAutocompletar} />);
    // Autocompletar first
    await userEvent.click(screen.getByRole('button', { name: /autocompletar con ia/i }));
    await waitFor(() => expect(screen.getByText('Mazo completado con éxito.')).toBeInTheDocument());
    // Click "Volver a autocompletar"
    await userEvent.click(screen.getByRole('button', { name: /volver a autocompletar/i }));
    // Should go back to initial autocompletar state
    await waitFor(() => expect(screen.queryByText('Mazo completado con éxito.')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: /autocompletar con ia/i })).toBeInTheDocument();
  });
});
