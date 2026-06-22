import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MTGCard } from '@/components/domain/MTGCard';

const carta = {
  nombre: 'Sol Ring',
  tipo: 'Artifact',
  costo_mana: '{1}',
  imagen_url: 'https://img/sol-ring.png',
};

describe('MTGCard', () => {
  it('thumbnail expone el nombre como aria-label', () => {
    render(<MTGCard carta={carta} variant="thumbnail" />);
    expect(screen.getByLabelText('Sol Ring')).toBeInTheDocument();
  });

  it('thumbnail clickeable tiene role button y dispara onClick', async () => {
    const onClick = vi.fn();
    render(<MTGCard carta={carta} variant="thumbnail" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'Sol Ring' }));
    expect(onClick).toHaveBeenCalled();
  });

  it('thumbnail clickeable responde a la tecla Enter', async () => {
    const onClick = vi.fn();
    render(<MTGCard carta={carta} variant="thumbnail" onClick={onClick} />);
    const card = screen.getByRole('button', { name: 'Sol Ring' });
    card.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });

  it('muestra placeholder cuando la carta no tiene imagen', () => {
    const { container } = render(<MTGCard carta={{ nombre: 'Sin Imagen' }} variant="thumbnail" />);
    expect(container.querySelector('.mtg-card__image--placeholder')).toBeInTheDocument();
  });

  it('variant inline muestra nombre, costo y badge de comandante', () => {
    const { container } = render(<MTGCard carta={carta} variant="inline" esComandante />);
    expect(screen.getByText('Sol Ring')).toBeInTheDocument();
    expect(container.querySelectorAll('i.ms').length).toBeGreaterThan(0);
    expect(container.querySelector('.mtg-card--commander')).toBeInTheDocument();
  });

  it('variant full muestra nombre y tipo', () => {
    render(<MTGCard carta={carta} variant="full" />);
    expect(screen.getByText('Sol Ring')).toBeInTheDocument();
    expect(screen.getByText('Artifact')).toBeInTheDocument();
  });

  it('usa el nombre por defecto cuando la carta es nula', () => {
    render(<MTGCard carta={null} variant="thumbnail" />);
    expect(screen.getAllByLabelText('Carta MTG').length).toBeGreaterThan(0);
  });

  it('muestra placeholder tras un error de imagen', () => {
    const { container } = render(<MTGCard carta={carta} variant="thumbnail" />);
    const img = container.querySelector('img');
    fireEvent.error(img);
    expect(container.querySelector('.mtg-card__image--placeholder')).toBeInTheDocument();
  });

  it('marca la imagen como cargada tras onLoad', () => {
    const { container } = render(<MTGCard carta={carta} variant="full" />);
    const img = container.querySelector('img');
    fireEvent.load(img);
    expect(container.querySelector('.mtg-card__image--oculta')).toBeNull();
  });

  it('variant inline sin imagen muestra placeholder y nombre', () => {
    const { container } = render(<MTGCard carta={{ nombre: 'Sin Img', costo_mana: '{2}' }} variant="inline" />);
    expect(screen.getByText('Sin Img')).toBeInTheDocument();
    expect(container.querySelector('.mtg-card__image--placeholder')).toBeInTheDocument();
  });
});
