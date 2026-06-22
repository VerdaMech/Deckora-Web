import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormatBadge } from '@/components/domain/FormatBadge';
import { FORMATO_LABELS } from '@/utils/constants';

describe('FormatBadge', () => {
  it('muestra la etiqueta del formato COMMANDER', () => {
    render(<FormatBadge formato="COMMANDER" />);
    expect(screen.getByText(FORMATO_LABELS.COMMANDER)).toBeInTheDocument();
  });

  it('muestra la etiqueta de cada formato conocido', () => {
    for (const [codigo, etiqueta] of Object.entries(FORMATO_LABELS)) {
      const { unmount } = render(<FormatBadge formato={codigo} />);
      expect(screen.getByText(etiqueta)).toBeInTheDocument();
      unmount();
    }
  });

  it('usa el código crudo si el formato es desconocido', () => {
    render(<FormatBadge formato="PAUPER" />);
    expect(screen.getByText('PAUPER')).toBeInTheDocument();
  });

  it('no renderiza nada si no hay formato', () => {
    const { container } = render(<FormatBadge formato={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
