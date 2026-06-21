import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Tooltip from '@/components/ui/Tooltip';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ErrorChunk from '@/components/ui/ErrorChunk';

describe('Tooltip', () => {
  it('renderiza el contenido envuelto', () => {
    render(<Tooltip content="Ayuda"><button>Hover</button></Tooltip>);
    expect(screen.getByRole('button', { name: 'Hover' })).toBeInTheDocument();
  });
});

describe('ErrorBoundary', () => {
  let errorSpy;
  beforeEach(() => { errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => errorSpy.mockRestore());

  const Bomba = () => { throw new Error('boom'); };

  it('renderiza los children cuando no hay error', () => {
    render(<ErrorBoundary><p>Todo bien</p></ErrorBoundary>);
    expect(screen.getByText('Todo bien')).toBeInTheDocument();
  });

  it('muestra el fallback por defecto cuando un hijo lanza', () => {
    render(<ErrorBoundary><Bomba /></ErrorBoundary>);
    expect(screen.getByText(/algo se rompió/i)).toBeInTheDocument();
  });

  it('usa el fallback personalizado si se provee', () => {
    render(<ErrorBoundary fallback={<p>Fallback custom</p>}><Bomba /></ErrorBoundary>);
    expect(screen.getByText('Fallback custom')).toBeInTheDocument();
  });
});

describe('ErrorChunk', () => {
  it('muestra el mensaje y el botón de reintentar', () => {
    render(<ErrorChunk />);
    expect(screen.getByText(/no se pudo cargar este módulo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });
});
