import { describe, it, expect } from 'vitest';
import {
  ROLES,
  FORMATOS,
  FORMATO_LABELS,
  ESTADO_TORNEO,
  ESTADO_TORNEO_LABELS,
  ESTADO_ENFRENTAMIENTO,
  TIPO_RONDA,
  RESULTADO_ENFRENTAMIENTO,
} from '@/utils/constants';

describe('constants', () => {
  it('ROLES define los tres roles del sistema', () => {
    expect(ROLES).toEqual({ JUGADOR: 'jugador', ORGANIZADOR: 'organizador', TIENDA: 'tienda' });
  });

  it('cada FORMATO tiene su etiqueta legible', () => {
    for (const key of Object.keys(FORMATOS)) {
      expect(FORMATO_LABELS[key]).toBeTruthy();
    }
    expect(FORMATO_LABELS.COMMANDER).toBe('Commander');
  });

  it('ESTADO_TORNEO_LABELS cubre todos los estados', () => {
    for (const valor of Object.values(ESTADO_TORNEO)) {
      expect(ESTADO_TORNEO_LABELS[valor]).toBeTruthy();
    }
  });

  it('expone los enums de enfrentamiento, ronda y resultado', () => {
    expect(ESTADO_ENFRENTAMIENTO.EN_CURSO).toBe('en_curso');
    expect(TIPO_RONDA.SWISS).toBe('swiss');
    expect(RESULTADO_ENFRENTAMIENTO.GANADOR).toBe('ganador');
  });
});
