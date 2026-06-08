import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PanelValidacion } from '@/modules/mazos/components/PanelValidacion';

describe('PanelValidacion', () => {
  it('muestra estado de carga cuando cargando es true', () => {
    render(<PanelValidacion cargando={true} />);
    expect(screen.getByText('Validando mazo...')).toBeInTheDocument();
  });

  it('muestra hint cuando no hay validación', () => {
    render(<PanelValidacion validacion={null} />);
    expect(screen.getByText(/panel de validación/i)).toBeInTheDocument();
  });

  it('muestra "Mazo válido" cuando validacion.valido es true y sin errores', () => {
    render(
      <PanelValidacion
        validacion={{ valido: true, reglas: [], advertencias: [] }}
        formato="COMMANDER"
        totalCartas={100}
      />,
    );
    expect(screen.getByText('Mazo válido')).toBeInTheDocument();
    expect(screen.getByText(/cumple todas las reglas/i)).toBeInTheDocument();
  });

  it('muestra "Mazo inválido" y lista de errores cuando hay reglas fallidas', () => {
    render(
      <PanelValidacion
        validacion={{ valido: false, reglas: ['Necesita 100 cartas', 'Falta comandante'], advertencias: [] }}
        formato="COMMANDER"
        totalCartas={50}
      />,
    );
    expect(screen.getByText('Mazo inválido')).toBeInTheDocument();
    expect(screen.getByText('Necesita 100 cartas')).toBeInTheDocument();
    expect(screen.getByText('Falta comandante')).toBeInTheDocument();
  });

  it('muestra "Con observaciones" cuando valido es false y no hay errores de regla', () => {
    render(
      <PanelValidacion
        validacion={{ valido: false, reglas: [], advertencias: ['Podrías añadir más tierras'] }}
        formato="STANDARD"
        totalCartas={60}
      />,
    );
    expect(screen.getByText('Con observaciones')).toBeInTheDocument();
    expect(screen.getByText('Podrías añadir más tierras')).toBeInTheDocument();
  });

  it('muestra el contador de cartas respecto al límite del formato', () => {
    render(
      <PanelValidacion
        validacion={{ valido: false, reglas: [], advertencias: [] }}
        formato="COMMANDER"
        totalCartas={75}
      />,
    );
    expect(screen.getByText('75 / 100 cartas')).toBeInTheDocument();
  });

  it('usa límite de 60 para formatos desconocidos', () => {
    render(
      <PanelValidacion
        validacion={{ valido: true, reglas: [], advertencias: [] }}
        formato="DESCONOCIDO"
        totalCartas={60}
      />,
    );
    expect(screen.getByText('60 / 60 cartas')).toBeInTheDocument();
  });

  it('acepta errores con propiedad message en lugar de string directo', () => {
    render(
      <PanelValidacion
        validacion={{ valido: false, reglas: [{ message: 'Error de formato' }], advertencias: [] }}
        formato="STANDARD"
        totalCartas={40}
      />,
    );
    expect(screen.getByText('Error de formato')).toBeInTheDocument();
  });

  it('acepta errores con propiedad mensaje', () => {
    render(
      <PanelValidacion
        validacion={{ valido: false, reglas: [{ mensaje: 'Carta duplicada' }], advertencias: [] }}
        formato="MODERN"
        totalCartas={60}
      />,
    );
    expect(screen.getByText('Carta duplicada')).toBeInTheDocument();
  });
});
