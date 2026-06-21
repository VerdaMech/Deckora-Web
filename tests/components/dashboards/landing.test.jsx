import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const { authState } = vi.hoisted(() => ({ authState: { value: {} } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => authState.value }));
vi.mock('@/modules/mapa/components/SeccionMapaTiendas', () => ({ default: () => <div data-testid="mapa-stub" /> }));

import HeroLanding from '@/modules/dashboards/components/HeroLanding';
import FeaturesLanding from '@/modules/dashboards/components/FeaturesLanding';
import ProfilesLanding from '@/modules/dashboards/components/ProfilesLanding';
import CTALanding from '@/modules/dashboards/components/CTALanding';
import BloqueResumen from '@/modules/dashboards/components/BloqueResumen';
import StatsRapidas from '@/modules/dashboards/components/StatsRapidas';
import Landing from '@/modules/dashboards/pages/Landing';

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);
beforeEach(() => { authState.value = { user: null, rol: null }; });

describe('HeroLanding', () => {
  it('muestra accesos para invitado', () => {
    wrap(<HeroLanding />);
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('muestra "Ir a mi panel" con el destino del rol cuando hay usuario', () => {
    authState.value = { user: { id: 1 }, rol: 'tienda' };
    wrap(<HeroLanding />);
    expect(screen.getByRole('link', { name: 'Ir a mi panel' })).toHaveAttribute('href', '/tienda');
  });
});

describe('FeaturesLanding', () => {
  it('lista las características', () => {
    render(<FeaturesLanding />);
    expect(screen.getByText('Gestiona tus mazos')).toBeInTheDocument();
    expect(screen.getByText('Asistente IA')).toBeInTheDocument();
  });
});

describe('ProfilesLanding', () => {
  it('muestra los tres roles', () => {
    render(<ProfilesLanding />);
    expect(screen.getByText('Jugador')).toBeInTheDocument();
    expect(screen.getByText('Organizador')).toBeInTheDocument();
    expect(screen.getByText('Tienda')).toBeInTheDocument();
  });
});

describe('CTALanding', () => {
  it('se muestra para invitados', () => {
    wrap(<CTALanding />);
    expect(screen.getByText('Únete a la mesa')).toBeInTheDocument();
  });

  it('no se renderiza si hay usuario', () => {
    authState.value = { user: { id: 1 } };
    const { container } = wrap(<CTALanding />);
    expect(container.firstChild).toBeNull();
  });
});

describe('BloqueResumen', () => {
  it('muestra título, cta y children', () => {
    wrap(
      <BloqueResumen titulo="Mis mazos" cta={{ texto: 'Ver todos', to: '/mazos' }}>
        <p>contenido</p>
      </BloqueResumen>,
    );
    expect(screen.getByText('Mis mazos')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver todos' })).toBeInTheDocument();
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('muestra spinner cuando carga', () => {
    wrap(<BloqueResumen titulo="x" cargando><p>oculto</p></BloqueResumen>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('oculto')).not.toBeInTheDocument();
  });
});

describe('StatsRapidas', () => {
  it('renderiza los items con su valor', () => {
    render(<StatsRapidas items={[{ label: 'Mazos', valor: 5 }, { label: 'Torneos', valor: 2 }]} />);
    expect(screen.getByText('Mazos')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('usa guion cuando el valor es nulo', () => {
    render(<StatsRapidas items={[{ label: 'Vacío', valor: null }]} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('Landing', () => {
  it('compone las secciones de la landing', () => {
    wrap(<Landing />);
    expect(screen.getByText('Todo lo que necesitas')).toBeInTheDocument();
    expect(screen.getByTestId('mapa-stub')).toBeInTheDocument();
  });
});
