import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommanderBadge } from '@/components/domain/CommanderBadge';

describe('CommanderBadge', () => {
  it('muestra la etiqueta CMDR', () => {
    render(<CommanderBadge />);
    expect(screen.getByText('CMDR')).toBeInTheDocument();
  });
});
