import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renderiza con el texto', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('aplica la clase de variante y tamaño', () => {
    render(<Button variant="danger" size="lg">X</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn--danger', 'btn--lg');
  });

  it('ejecuta onClick al hacer click', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>OK</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('no ejecuta onClick cuando está disabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>OK</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('queda deshabilitado y muestra spinner cuando loading', () => {
    render(<Button loading>OK</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renderiza el ícono cuando se pasa y no está loading', () => {
    const Icono = ({ size }) => <svg data-testid="icono" width={size} />;
    render(<Button icon={Icono}>Con ícono</Button>);
    expect(screen.getByTestId('icono')).toBeInTheDocument();
  });
});
