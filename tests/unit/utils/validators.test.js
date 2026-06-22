import { describe, it, expect } from 'vitest';
import {
  validarEmail,
  validarPasswordMin,
  validarRequerido,
  validarFechaFutura,
  validarUrl,
} from '@/utils/validators';

// Los validadores siguen el patrón de react-hook-form: devuelven `true` si el
// valor es válido, o un string con el mensaje de error si no lo es.

describe('validarEmail', () => {
  it('acepta un correo válido', () => {
    expect(validarEmail('usuario@dominio.com')).toBe(true);
  });
  it('rechaza un correo sin arroba', () => {
    expect(validarEmail('usuario.dominio.com')).toBe('Ingresa un correo válido.');
  });
  it('rechaza un correo sin dominio de nivel superior', () => {
    expect(validarEmail('usuario@dominio')).toBe('Ingresa un correo válido.');
  });
  it('rechaza valor vacío', () => {
    expect(validarEmail('')).toBe('Ingresa un correo válido.');
  });
  it('rechaza null', () => {
    expect(validarEmail(null)).toBe('Ingresa un correo válido.');
  });
});

describe('validarPasswordMin', () => {
  it('acepta password con el mínimo por defecto (8)', () => {
    expect(validarPasswordMin()('12345678')).toBe(true);
  });
  it('rechaza password más corto que el mínimo por defecto', () => {
    expect(validarPasswordMin()('1234567')).toBe('Mínimo 8 caracteres.');
  });
  it('respeta un mínimo personalizado', () => {
    expect(validarPasswordMin(4)('1234')).toBe(true);
    expect(validarPasswordMin(4)('123')).toBe('Mínimo 4 caracteres.');
  });
  it('rechaza undefined sin lanzar error', () => {
    expect(validarPasswordMin()(undefined)).toBe('Mínimo 8 caracteres.');
  });
});

describe('validarRequerido', () => {
  it('acepta un valor con contenido', () => {
    expect(validarRequerido('algo')).toBe(true);
  });
  it('rechaza un valor de solo espacios', () => {
    expect(validarRequerido('   ')).toBe('Este campo es requerido.');
  });
  it('rechaza string vacío', () => {
    expect(validarRequerido('')).toBe('Este campo es requerido.');
  });
  it('rechaza null sin lanzar error', () => {
    expect(validarRequerido(null)).toBe('Este campo es requerido.');
  });
});

describe('validarFechaFutura', () => {
  it('acepta una fecha claramente futura', () => {
    expect(validarFechaFutura('2999-12-31')).toBe(true);
  });
  it('rechaza una fecha pasada', () => {
    expect(validarFechaFutura('2000-01-01')).toBe('La fecha debe ser futura.');
  });
});

describe('validarUrl', () => {
  it('acepta valor vacío (campo opcional)', () => {
    expect(validarUrl('')).toBe(true);
  });
  it('acepta undefined (campo opcional)', () => {
    expect(validarUrl(undefined)).toBe(true);
  });
  it('acepta una URL http', () => {
    expect(validarUrl('http://deckora.cl')).toBe(true);
  });
  it('acepta una URL https con ruta', () => {
    expect(validarUrl('https://deckora.cl/torneos')).toBe(true);
  });
  it('rechaza un esquema que no es http(s)', () => {
    expect(validarUrl('ftp://deckora.cl')).toBe(
      'URL inválida (debe empezar con http o https).',
    );
  });
  it('rechaza un texto que no es URL', () => {
    expect(validarUrl('deckora')).toBe(
      'URL inválida (debe empezar con http o https).',
    );
  });
});
