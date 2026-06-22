import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

describe('Alert', () => {
  it('renderiza el contenido con role alert', () => {
    render(<Alert variant="success">Guardado</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Guardado');
  });

  it('aplica la clase de variante', () => {
    render(<Alert variant="danger">Error</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('alert--danger');
  });

  it('puede ocultar el ícono', () => {
    const { container } = render(<Alert icon={false}>Sin ícono</Alert>);
    expect(container.querySelector('.alert__icon')).toBeNull();
  });
});

describe('Badge', () => {
  it('traduce el valor de formato', () => {
    render(<Badge variant="format" value="COMMANDER" />);
    expect(screen.getByText('Commander')).toBeInTheDocument();
  });

  it('usa children por encima del value', () => {
    render(<Badge variant="estado" value="pendiente">Custom</Badge>);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('cae al value crudo si la variante no lo reconoce', () => {
    render(<Badge variant="default" value="loquesea" />);
    expect(screen.getByText('loquesea')).toBeInTheDocument();
  });
});

describe('Card', () => {
  it('renderiza children y la variante', () => {
    const { container } = render(<Card variant="elevated">Contenido</Card>);
    expect(screen.getByText('Contenido')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('card--elevated');
  });

  it('permite cambiar la etiqueta con la prop as', () => {
    const { container } = render(<Card as="section">x</Card>);
    expect(container.querySelector('section')).toBeInTheDocument();
  });
});

describe('Spinner', () => {
  it('renderiza con role status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra el mensaje de cold start cuando corresponde', () => {
    render(<Spinner mostrarColdStart />);
    expect(screen.getByText(/servidor está despertando/i)).toBeInTheDocument();
  });
});

describe('Skeleton', () => {
  it('aplica width y height por estilo', () => {
    const { container } = render(<Skeleton width={120} height={20} />);
    const el = container.firstChild;
    expect(el).toHaveClass('skeleton');
    expect(el).toHaveStyle({ width: '120px', height: '20px' });
  });
});

describe('EmptyState', () => {
  it('renderiza título y descripción', () => {
    render(<EmptyState title="Sin mazos" description="Crea tu primer mazo" />);
    expect(screen.getByText('Sin mazos')).toBeInTheDocument();
    expect(screen.getByText('Crea tu primer mazo')).toBeInTheDocument();
  });

  it('renderiza ícono y acción cuando se pasan', () => {
    const Icono = () => <svg data-testid="empty-icon" />;
    render(<EmptyState icon={Icono} title="x" action={<button>Nuevo</button>} />);
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument();
  });
});
