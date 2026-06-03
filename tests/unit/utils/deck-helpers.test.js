import { describe, it, expect } from 'vitest';
import {
  agruparPorTipo,
  calcularCurva,
  calcularDistribucionColor,
  parseManaCost,
  contarCartasMazo,
} from '@/utils/deck-helpers';

describe('contarCartasMazo', () => {
  it('devuelve 0 para un mazo vacío', () => {
    expect(contarCartasMazo([])).toBe(0);
  });
  it('suma las cantidades de cada entrada', () => {
    expect(contarCartasMazo([{ cantidad: 2 }, { cantidad: 3 }])).toBe(5);
  });
  it('asume cantidad 1 si no está definida', () => {
    expect(contarCartasMazo([{}, {}])).toBe(2);
  });
  it('usa [] por defecto sin argumentos', () => {
    expect(contarCartasMazo()).toBe(0);
  });
});

describe('agruparPorTipo', () => {
  it('coloca el comandante en su grupo aunque sea criatura', () => {
    const grupos = agruparPorTipo([
      { esComandante: true, carta: { tipo: 'Legendary Creature — Angel' } },
    ]);
    expect(grupos.comandante).toHaveLength(1);
    expect(grupos.criaturas).toHaveLength(0);
  });
  it('clasifica cada tipo en su grupo correspondiente', () => {
    const grupos = agruparPorTipo([
      { tipo: 'Creature — Elf' },
      { tipo: 'Basic Land — Forest' },
      { tipo: 'Instant' },
      { tipo: 'Sorcery' },
      { tipo: 'Artifact' },
      { tipo: 'Enchantment' },
      { tipo: 'Planeswalker — Jace' },
    ]);
    expect(grupos.criaturas).toHaveLength(1);
    expect(grupos.tierras).toHaveLength(1);
    expect(grupos.instantaneos).toHaveLength(1);
    expect(grupos.conjuros).toHaveLength(1);
    expect(grupos.artefactos).toHaveLength(1);
    expect(grupos.encantamientos).toHaveLength(1);
    expect(grupos.planeswalkers).toHaveLength(1);
  });
  it('coloca tipos no reconocidos o vacíos en "otros"', () => {
    const grupos = agruparPorTipo([{ tipo: 'Dungeon' }, { tipo: '' }]);
    expect(grupos.otros).toHaveLength(2);
  });
  it('soporta tanto la forma { carta } como la carta plana, y type_line/typeLine', () => {
    const grupos = agruparPorTipo([
      { carta: { type_line: 'Creature' } },
      { typeLine: 'Land' },
    ]);
    expect(grupos.criaturas).toHaveLength(1);
    expect(grupos.tierras).toHaveLength(1);
  });
});

describe('calcularCurva', () => {
  it('agrupa por costo de maná, ignora tierras y acumula cantidades', () => {
    const curva = calcularCurva([
      { carta: { tipo: 'Creature', cmc: 1 }, cantidad: 4 },
      { carta: { tipo: 'Creature', cmc: 3 }, cantidad: 2 },
      { carta: { tipo: 'Land', cmc: 0 }, cantidad: 10 },
      { carta: { tipo: 'Sorcery', cmc: 8 }, cantidad: 1 },
      { carta: { tipo: 'Instant', costo_mana: '{2}{U}' }, cantidad: 1 },
    ]);
    const bucket = (cmc) => curva.find((b) => b.cmc === cmc).count;
    expect(curva).toHaveLength(8); // 0..6 y 7+
    expect(bucket('1')).toBe(4);
    expect(bucket('3')).toBe(3); // cmc 3 (x2) + parseo de {2}{U} = 3 (x1)
    expect(bucket('7+')).toBe(1);
    expect(bucket('0')).toBe(0); // la tierra fue ignorada
  });
});

describe('calcularDistribucionColor', () => {
  it('usa el array de colores cuando está presente', () => {
    const dist = calcularDistribucionColor([
      { carta: { colors: ['U'] }, cantidad: 2 },
      { carta: { colors: ['W', 'B'] }, cantidad: 1 },
    ]);
    expect(dist.U).toBe(2);
    expect(dist.W).toBe(1);
    expect(dist.B).toBe(1);
  });
  it('extrae los colores del costo de maná si no hay array', () => {
    const dist = calcularDistribucionColor([
      { carta: { costo_mana: '{R}{R}' }, cantidad: 1 },
    ]);
    expect(dist.R).toBe(1);
  });
  it('cuenta como incoloro (C) las cartas sin color', () => {
    const dist = calcularDistribucionColor([
      { carta: { colors: [], costo_mana: '{3}' }, cantidad: 2 },
    ]);
    expect(dist.C).toBe(2);
  });
});

describe('parseManaCost', () => {
  it('extrae cada símbolo de maná', () => {
    expect(parseManaCost('{2}{U}{U}')).toEqual(['{2}', '{U}', '{U}']);
  });
  it('devuelve [] para string vacío', () => {
    expect(parseManaCost('')).toEqual([]);
  });
  it('devuelve [] por defecto sin argumentos', () => {
    expect(parseManaCost()).toEqual([]);
  });
  it('devuelve [] si no hay símbolos', () => {
    expect(parseManaCost('sin simbolos')).toEqual([]);
  });
});
