import { describe, it, expect } from 'vitest';
import {
  cupoDisponible,
  puedeInscribirse,
  estadoVisualTorneo,
} from '@/utils/torneos-helpers';
import { ESTADO_TORNEO, ROLES } from '@/utils/constants';

const torneoPendiente = (overrides = {}) => ({
  id: 'torneo-1',
  estado: ESTADO_TORNEO.PENDIENTE,
  cupo_maximo: 8,
  inscritos_count: 0,
  ...overrides,
});

const jugador = { id: 'u-1', rol: ROLES.JUGADOR };

describe('cupoDisponible', () => {
  it('devuelve false si el torneo es nulo', () => {
    expect(cupoDisponible(null)).toBe(false);
  });
  it('devuelve true si no hay cupo máximo definido', () => {
    expect(cupoDisponible({ cupo_maximo: null })).toBe(true);
  });
  it('devuelve true cuando aún quedan cupos', () => {
    expect(cupoDisponible({ cupo_maximo: 8, inscritos_count: 3 })).toBe(true);
  });
  it('devuelve false cuando el cupo está lleno', () => {
    expect(cupoDisponible({ cupo_maximo: 8, inscritos_count: 8 })).toBe(false);
  });
  it('asume 0 inscritos si no viene el conteo', () => {
    expect(cupoDisponible({ cupo_maximo: 8 })).toBe(true);
  });
});

describe('puedeInscribirse', () => {
  it('permite a un jugador en torneo pendiente con cupo y sin inscripción previa', () => {
    expect(puedeInscribirse(torneoPendiente(), jugador, [])).toBe(true);
  });
  it('no permite si el usuario no es jugador', () => {
    const organizador = { id: 'u-2', rol: ROLES.ORGANIZADOR };
    expect(puedeInscribirse(torneoPendiente(), organizador, [])).toBe(false);
  });
  it('no permite si el torneo no está pendiente', () => {
    const torneo = torneoPendiente({ estado: ESTADO_TORNEO.EN_CURSO });
    expect(puedeInscribirse(torneo, jugador, [])).toBe(false);
  });
  it('no permite si el cupo está lleno', () => {
    const torneo = torneoPendiente({ inscritos_count: 8 });
    expect(puedeInscribirse(torneo, jugador, [])).toBe(false);
  });
  it('no permite si el jugador ya está inscrito (usuario_id)', () => {
    expect(puedeInscribirse(torneoPendiente(), jugador, [{ usuario_id: 'u-1' }])).toBe(false);
  });
  it('no permite si el jugador ya está inscrito (jugador_id)', () => {
    expect(puedeInscribirse(torneoPendiente(), jugador, [{ jugador_id: 'u-1' }])).toBe(false);
  });
  it('devuelve false si falta el torneo o el usuario', () => {
    expect(puedeInscribirse(null, jugador, [])).toBe(false);
    expect(puedeInscribirse(torneoPendiente(), null, [])).toBe(false);
  });
});

describe('estadoVisualTorneo', () => {
  it('devuelve "" si el torneo es nulo', () => {
    expect(estadoVisualTorneo(null)).toBe('');
  });
  it.each([
    [ESTADO_TORNEO.PENDIENTE, 'pendiente'],
    [ESTADO_TORNEO.EN_CURSO, 'en_curso'],
    [ESTADO_TORNEO.FINALIZADO, 'finalizado'],
    [ESTADO_TORNEO.CANCELADO, 'cancelado'],
  ])('mapea el estado %s', (estado, esperado) => {
    expect(estadoVisualTorneo({ estado })).toBe(esperado);
  });
  it('devuelve el estado crudo si es desconocido', () => {
    expect(estadoVisualTorneo({ estado: 'archivado' })).toBe('archivado');
  });
});
