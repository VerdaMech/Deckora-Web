import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '@/components/ui/Modal';

describe('Modal', () => {
  it('no muestra el contenido cuando show es false', () => {
    render(<Modal show={false} title="Título" onHide={vi.fn()}>Cuerpo</Modal>);
    expect(screen.queryByText('Cuerpo')).not.toBeInTheDocument();
  });

  it('muestra título, cuerpo y footer cuando show es true', () => {
    render(
      <Modal show title="Mi modal" onHide={vi.fn()} footer={<button>Aceptar</button>}>
        Cuerpo del modal
      </Modal>,
    );
    expect(screen.getByText('Mi modal')).toBeInTheDocument();
    expect(screen.getByText('Cuerpo del modal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument();
  });

  it('llama onHide al hacer click en el botón cerrar', async () => {
    const onHide = vi.fn();
    render(<Modal show title="X" onHide={onHide}>c</Modal>);
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onHide).toHaveBeenCalled();
  });
});
