import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('muestra título y mensaje cuando está abierto', () => {
    render(
      <ConfirmDialog abierto titulo="Eliminar mazo" mensaje="¿Seguro?" onConfirmar={vi.fn()} onCancelar={vi.fn()} />,
    );
    expect(screen.getByText('Eliminar mazo')).toBeInTheDocument();
    expect(screen.getByText('¿Seguro?')).toBeInTheDocument();
  });

  it('llama onConfirmar y onCancelar', async () => {
    const onConfirmar = vi.fn();
    const onCancelar = vi.fn();
    render(
      <ConfirmDialog abierto titulo="t" mensaje="m" textoConfirmar="Sí" textoCancelar="No" onConfirmar={onConfirmar} onCancelar={onCancelar} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Sí' }));
    expect(onConfirmar).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(onCancelar).toHaveBeenCalled();
  });

  it('con requiereTexto, el botón confirmar se habilita solo al escribir el texto exacto', async () => {
    const onConfirmar = vi.fn();
    render(
      <ConfirmDialog abierto titulo="t" mensaje="m" textoConfirmar="Borrar" requiereTexto="ELIMINAR" onConfirmar={onConfirmar} onCancelar={vi.fn()} />,
    );
    const confirmar = screen.getByRole('button', { name: 'Borrar' });
    expect(confirmar).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('ELIMINAR'), { target: { value: 'ELIMINAR' } });
    expect(confirmar).toBeEnabled();
  });
});
