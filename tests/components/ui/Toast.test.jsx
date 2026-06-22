import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from '@/components/ui/Toast';

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('renderiza título y mensaje', () => {
    render(<Toast id="1" variante="exito" titulo="Listo" mensaje="Guardado" onCerrar={vi.fn()} />);
    expect(screen.getByText('Listo')).toBeInTheDocument();
    expect(screen.getByText('Guardado')).toBeInTheDocument();
  });

  it('usa role alert para variantes de error', () => {
    render(<Toast id="1" variante="error" titulo="Falló" onCerrar={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('se auto-cierra tras la duración', () => {
    const onCerrar = vi.fn();
    render(<Toast id="42" variante="info" titulo="Hola" duracion={1000} onCerrar={onCerrar} />);
    act(() => vi.advanceTimersByTime(1000));
    act(() => vi.advanceTimersByTime(150));
    expect(onCerrar).toHaveBeenCalledWith('42');
  });

  it('no se auto-cierra cuando la duración es null', () => {
    const onCerrar = vi.fn();
    render(<Toast id="1" variante="info" titulo="Persistente" duracion={null} onCerrar={onCerrar} />);
    act(() => vi.advanceTimersByTime(10000));
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('se cierra al hacer click en el botón cerrar', () => {
    const onCerrar = vi.fn();
    render(<Toast id="7" variante="info" titulo="Hola" duracion={null} onCerrar={onCerrar} />);
    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));
    act(() => vi.advanceTimersByTime(150));
    expect(onCerrar).toHaveBeenCalledWith('7');
  });
});
