export function agruparPorTipo(cartas = []) {
  const grupos = {
    comandante: [],
    criaturas: [],
    tierras: [],
    instantaneos: [],
    conjuros: [],
    artefactos: [],
    encantamientos: [],
    planeswalkers: [],
    otros: [],
  };

  for (const entrada of cartas) {
    const carta = entrada.carta ?? entrada;
    const tipos = (carta.tipo ?? carta.type_line ?? carta.typeLine ?? '').toLowerCase();

    if (entrada.esComandante) {
      grupos.comandante.push(entrada);
    } else if (tipos.includes('creature')) {
      grupos.criaturas.push(entrada);
    } else if (tipos.includes('land')) {
      grupos.tierras.push(entrada);
    } else if (tipos.includes('instant')) {
      grupos.instantaneos.push(entrada);
    } else if (tipos.includes('sorcery')) {
      grupos.conjuros.push(entrada);
    } else if (tipos.includes('artifact')) {
      grupos.artefactos.push(entrada);
    } else if (tipos.includes('enchantment')) {
      grupos.encantamientos.push(entrada);
    } else if (tipos.includes('planeswalker')) {
      grupos.planeswalkers.push(entrada);
    } else {
      grupos.otros.push(entrada);
    }
  }

  return grupos;
}

export function calcularCurva(cartas = []) {
  const counts = {};

  for (const entrada of cartas) {
    const carta = entrada.carta ?? entrada;
    const tipos = (carta.tipo ?? carta.type_line ?? carta.typeLine ?? '').toLowerCase();
    if (tipos.includes('land')) continue;

    const cmc = carta.cmc ?? 0;
    const bucket = cmc >= 7 ? '7+' : String(Math.floor(cmc));
    counts[bucket] = (counts[bucket] ?? 0) + (entrada.cantidad ?? 1);
  }

  const result = [];
  for (let i = 0; i <= 6; i++) {
    result.push({ cmc: String(i), count: counts[String(i)] ?? 0 });
  }
  result.push({ cmc: '7+', count: counts['7+'] ?? 0 });
  return result;
}

export function calcularDistribucionColor(cartas = []) {
  const dist = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };

  for (const entrada of cartas) {
    const carta = entrada.carta ?? entrada;
    const colors = carta.colors ?? [];
    if (colors.length === 0) {
      dist.C += entrada.cantidad ?? 1;
    } else {
      for (const c of colors) {
        if (c in dist) dist[c] += entrada.cantidad ?? 1;
      }
    }
  }

  return dist;
}

export function parseManaCost(cost = '') {
  return cost.match(/\{[^}]+\}/g) ?? [];
}

export function contarCartasMazo(cartas = []) {
  return cartas.reduce((total, entrada) => total + (entrada.cantidad ?? 1), 0);
}
