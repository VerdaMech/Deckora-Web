import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { importarMazo } = vi.hoisted(() => ({ importarMazo: vi.fn() }));
vi.mock('@/services/mazos.service', () => ({ importarMazo: (...a) => importarMazo(...a) }));

import { ImportarMazoModal } from '@/modules/mazos/components/ImportarMazoModal';

beforeEach(() => vi.clearAllMocks());

describe('ImportarMazoModal', () => {
  it('importa la lista y muestra el resumen', async () => {
    importarMazo.mockResolvedValue({
      importadas: [{ cantidad: 1, nombre: 'Sol Ring' }],
      fallidas: [{ error: 'No encontrada', linea: '1 Carta Falsa' }],
    });
    const onImportado = vi.fn();
    render(<ImportarMazoModal show mazoId={1} onHide={vi.fn()} onImportado={onImportado} />);
    await userEvent.type(screen.getByPlaceholderText(/Krenko/), '1 Sol Ring');
    await userEvent.click(screen.getByRole('button', { name: 'Importar' }));
    await waitFor(() => expect(importarMazo).toHaveBeenCalledWith(1, '1 Sol Ring'));
    expect(await screen.findByText(/1 carta importada/i)).toBeInTheDocument();
    expect(screen.getByText(/1 línea con error/i)).toBeInTheDocument();
    expect(onImportado).toHaveBeenCalled();
  });

  it('el botón importar está deshabilitado sin contenido', () => {
    render(<ImportarMazoModal show mazoId={1} onHide={vi.fn()} onImportado={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Importar' })).toBeDisabled();
  });

  it('muestra error si la importación falla', async () => {
    importarMazo.mockRejectedValue(new Error('Formato inválido'));
    render(<ImportarMazoModal show mazoId={1} onHide={vi.fn()} onImportado={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText(/Krenko/), '1 X');
    await userEvent.click(screen.getByRole('button', { name: 'Importar' }));
    expect(await screen.findByText('Formato inválido')).toBeInTheDocument();
  });
});
