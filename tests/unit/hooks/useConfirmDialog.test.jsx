import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

function Host({ onConfirmar, conAccion = true }) {
  const { confirmar, ConfirmDialogPortal } = useConfirmDialog();
  return (
    <>
      <button onClick={() => confirmar({ titulo: 'Eliminar', mensaje: 'Mensaje de prueba', textoConfirmar: 'Sí', textoCancelar: 'No', onConfirmar: conAccion ? onConfirmar : null })}>
        abrir
      </button>
      <ConfirmDialogPortal />
    </>
  );
}

describe('useConfirmDialog', () => {
  it('no muestra el diálogo hasta llamar a confirmar', () => {
    render(<Host onConfirmar={vi.fn()} />);
    expect(screen.queryByText('Mensaje de prueba')).not.toBeInTheDocument();
  });

  it('abre el diálogo con la configuración pasada', async () => {
    render(<Host onConfirmar={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'abrir' }));
    expect(await screen.findByText('Mensaje de prueba')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('ejecuta onConfirmar al confirmar', async () => {
    const onConfirmar = vi.fn().mockResolvedValue(undefined);
    render(<Host onConfirmar={onConfirmar} />);
    await userEvent.click(screen.getByRole('button', { name: 'abrir' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Sí' }));
    await waitFor(() => expect(onConfirmar).toHaveBeenCalled());
  });

  it('cierra el diálogo al cancelar', async () => {
    render(<Host onConfirmar={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'abrir' }));
    await userEvent.click(await screen.findByRole('button', { name: 'No' }));
    await waitFor(() => expect(screen.queryByText('Mensaje de prueba')).not.toBeInTheDocument());
  });

  it('si no hay onConfirmar, confirmar simplemente cierra', async () => {
    render(<Host onConfirmar={vi.fn()} conAccion={false} />);
    await userEvent.click(screen.getByRole('button', { name: 'abrir' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Sí' }));
    await waitFor(() => expect(screen.queryByText('Mensaje de prueba')).not.toBeInTheDocument());
  });
});
