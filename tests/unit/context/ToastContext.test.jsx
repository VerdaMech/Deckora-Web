import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '@/context/ToastContext';

function Host() {
  const { mostrarExito, mostrarError, mostrarToast } = useToast();
  let n = 0;
  return (
    <div>
      <button onClick={() => mostrarExito('Éxito', 'detalle')}>exito</button>
      <button onClick={() => mostrarError('Error feo')}>error</button>
      <button onClick={() => { for (let i = 0; i < 5; i++) mostrarToast({ titulo: `T${n++}` }); }}>muchos</button>
    </div>
  );
}

describe('ToastContext', () => {
  it('mostrarExito agrega un toast visible', async () => {
    render(<ToastProvider><Host /></ToastProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'exito' }));
    expect(screen.getByText('Éxito')).toBeInTheDocument();
    expect(screen.getByText('detalle')).toBeInTheDocument();
  });

  it('mostrarError usa la variante de error (role alert)', async () => {
    render(<ToastProvider><Host /></ToastProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'error' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Error feo');
  });

  it('limita la cantidad de toasts a un máximo de 4', async () => {
    render(<ToastProvider><Host /></ToastProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'muchos' }));
    // se piden 5 pero solo deben quedar los últimos 4
    expect(screen.queryByText('T0')).not.toBeInTheDocument();
    expect(screen.getByText('T1')).toBeInTheDocument();
    expect(screen.getByText('T4')).toBeInTheDocument();
  });

  it('useToast fuera del provider lanza error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Suelto() { useToast(); return null; }
    expect(() => render(<Suelto />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
