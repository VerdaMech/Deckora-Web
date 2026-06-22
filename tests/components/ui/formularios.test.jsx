import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

describe('Input', () => {
  it('renderiza el label y asocia el control', () => {
    render(<Input label="Correo" />);
    expect(screen.getByLabelText('Correo')).toBeInTheDocument();
  });

  it('propaga onChange', async () => {
    const onChange = vi.fn();
    render(<Input label="Nombre" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Nombre'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('muestra el error y marca aria-invalid', () => {
    render(<Input label="Correo" error="Inválido" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Inválido');
    expect(screen.getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'true');
  });

  it('muestra helperText cuando no hay error', () => {
    render(<Input label="Correo" helperText="Usa tu correo institucional" />);
    expect(screen.getByText('Usa tu correo institucional')).toBeInTheDocument();
  });

  it('marca el asterisco de requerido', () => {
    render(<Input label="Correo" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});

describe('Textarea', () => {
  it('renderiza con label y filas', () => {
    render(<Textarea label="Bio" rows={6} />);
    const ta = screen.getByLabelText('Bio');
    expect(ta).toBeInTheDocument();
    expect(ta).toHaveAttribute('rows', '6');
  });

  it('muestra el error con prioridad sobre el helper', () => {
    render(<Textarea label="Bio" error="Muy corto" helperText="opcional" />);
    expect(screen.getByText('Muy corto')).toBeInTheDocument();
    expect(screen.queryByText('opcional')).not.toBeInTheDocument();
  });
});

describe('Select', () => {
  it('renderiza opciones desde la prop options', () => {
    render(
      <Select label="Formato" options={[{ value: 'C', label: 'Commander' }, { value: 'S', label: 'Standard' }]} />,
    );
    expect(screen.getByRole('option', { name: 'Commander' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Standard' })).toBeInTheDocument();
  });

  it('renderiza children cuando no hay options', () => {
    render(
      <Select label="Rol">
        <option value="j">Jugador</option>
      </Select>,
    );
    expect(screen.getByRole('option', { name: 'Jugador' })).toBeInTheDocument();
  });

  it('dispara onChange al seleccionar', async () => {
    const onChange = vi.fn();
    render(
      <Select label="Formato" onChange={onChange} options={[{ value: 'C', label: 'Commander' }, { value: 'S', label: 'Standard' }]} />,
    );
    await userEvent.selectOptions(screen.getByLabelText('Formato'), 'S');
    expect(onChange).toHaveBeenCalled();
  });

  it('muestra el error', () => {
    render(<Select label="Formato" error="Requerido" options={[]} />);
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });
});
