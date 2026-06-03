import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getInitials,
  relativeDate,
  formatFecha,
  formatHora,
  formatCupo,
} from '@/utils/formatters';

describe('getInitials', () => {
  it('toma las dos primeras letras en mayúscula', () => {
    expect(getInitials('juan')).toBe('JU');
  });
  it('devuelve "?" si el nombre es nulo', () => {
    expect(getInitials(null)).toBe('?');
  });
});

describe('relativeDate', () => {
  const SEG = 1000;
  const MIN = 60 * SEG;
  const HORA = 60 * MIN;
  const DIA = 24 * HORA;
  const haceMs = (ms) => new Date(Date.now() - ms).toISOString();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-03T12:00:00Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('devuelve "" si no hay fecha', () => {
    expect(relativeDate('')).toBe('');
    expect(relativeDate(null)).toBe('');
  });
  it('"hace un momento" para menos de un minuto', () => {
    expect(relativeDate(haceMs(30 * SEG))).toBe('hace un momento');
  });
  it('minutos', () => {
    expect(relativeDate(haceMs(5 * MIN))).toBe('hace 5 min');
  });
  it('horas', () => {
    expect(relativeDate(haceMs(2 * HORA))).toBe('hace 2 h');
  });
  it('días en plural', () => {
    expect(relativeDate(haceMs(3 * DIA))).toBe('hace 3 días');
  });
  it('día en singular', () => {
    expect(relativeDate(haceMs(1 * DIA))).toBe('hace 1 día');
  });
  it('semanas', () => {
    expect(relativeDate(haceMs(14 * DIA))).toBe('hace 2 semanas');
  });
  it('meses', () => {
    expect(relativeDate(haceMs(60 * DIA))).toBe('hace 2 meses');
  });
  it('años', () => {
    expect(relativeDate(haceMs(730 * DIA))).toBe('hace 2 años');
  });
});

describe('formatFecha', () => {
  it('devuelve "" para valor vacío o nulo', () => {
    expect(formatFecha('')).toBe('');
    expect(formatFecha(null)).toBe('');
  });
  it('formatea en español (es-CL) con el mes en palabra', () => {
    const salida = formatFecha('2027-01-15T12:00:00Z');
    expect(salida).toContain('2027');
    expect(salida).toContain('enero');
  });
});

describe('formatHora', () => {
  it('devuelve "" para valor vacío', () => {
    expect(formatHora('')).toBe('');
  });
  it('formatea como HH:MM en 24 horas', () => {
    expect(formatHora('2027-01-15T09:30:00Z')).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe('formatCupo', () => {
  it('sin cupo máximo muestra inscritos en plural', () => {
    expect(formatCupo(3, null)).toBe('3 inscritos');
  });
  it('sin cupo máximo usa singular para 1', () => {
    expect(formatCupo(1, null)).toBe('1 inscrito');
  });
  it('con cupo máximo muestra actuales / max', () => {
    expect(formatCupo(3, 32)).toBe('3 / 32');
  });
  it('asume 0 inscritos si actuales es nulo', () => {
    expect(formatCupo(null, null)).toBe('0 inscritos');
  });
});
