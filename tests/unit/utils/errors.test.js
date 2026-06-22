import { describe, it, expect } from 'vitest';
import { traducirError, esColdStart } from '@/utils/errors';

// ═══════════════════════════════════════════════════════════════════════════
// OWASP A10:2025 — Condiciones excepcionales (manejo de errores en el frontend)
//
// `traducirError` es el manejador centralizado que convierte cualquier error de
// la API/red en un mensaje amigable en español. Estos tests verifican que el
// usuario nunca ve un stack trace ni un detalle técnico, y que cada condición
// (500 / 429 / red caída / 403) produce un mensaje claro.
// ═══════════════════════════════════════════════════════════════════════════

describe('A10 (frontend) — traducirError()', () => {
  it('TC-SEC-A10-W01: un error 500 muestra un mensaje genérico amigable, no un stack trace', () => {
    const msg = traducirError({ status: 500 });

    expect(msg).toBe('El servidor tuvo un problema. Intenta de nuevo en un momento.');
    // No se filtra nada con forma de stack trace ("at archivo:linea:columna").
    expect(msg).not.toMatch(/at .+:\d+:\d+/);
  });

  it('TC-SEC-A10-W02: un error 429 (rate limit) muestra un mensaje de "espera/intenta más tarde"', () => {
    expect(traducirError({ status: 429 })).toMatch(/espera|muchas peticiones/i);
  });

  it('TC-SEC-A10-W03: un error de red (Failed to fetch) muestra "sin conexión"', () => {
    expect(traducirError(new Error('Failed to fetch'))).toMatch(/conectar al servidor|conexión/i);
  });

  it('TC-SEC-A10-W04: un error 403 muestra "no tienes permiso"', () => {
    expect(traducirError({ status: 403 })).toMatch(/permiso/i);
  });

  it('TC-SEC-A10-W05: un mensaje con apariencia de stack trace NO se muestra al usuario', () => {
    const errorConStack = new Error(
      'TypeError: x is undefined\n    at Object.<anonymous> (/app/src/server.js:12:9)',
    );
    const msg = traducirError(errorConStack);

    expect(msg).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
    expect(msg).not.toContain('server.js');
  });

  it('TC-SEC-A10-W06: sin error devuelve un mensaje seguro por defecto', () => {
    expect(traducirError(null)).toBe('Ocurrió un error inesperado. Intenta de nuevo.');
  });
});

describe('A10 (frontend) — esColdStart()', () => {
  it('TC-SEC-A10-W07: un 503 se detecta como servicio no disponible (cold start)', () => {
    expect(esColdStart({ status: 503 })).toBe(true);
  });

  it('TC-SEC-A10-W08: un error de validación 400 no es cold start', () => {
    expect(esColdStart({ status: 400 })).toBe(false);
  });
});
