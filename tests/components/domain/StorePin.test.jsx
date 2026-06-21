import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StorePin } from '@/components/domain/StorePin';

describe('StorePin', () => {
  it('renderiza el pin base', () => {
    const { container } = render(<StorePin />);
    expect(container.querySelector('.store-pin')).toBeInTheDocument();
    expect(container.querySelector('.store-pin--active')).toBeNull();
  });

  it('agrega el modificador activo', () => {
    const { container } = render(<StorePin activo />);
    expect(container.querySelector('.store-pin--active')).toBeInTheDocument();
  });
});
