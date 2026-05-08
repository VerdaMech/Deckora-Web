import { apiGet } from './api';

export function listarCartas({ page = 1, limit = 50, set_codigo } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (set_codigo) params.set('set_codigo', set_codigo);
  return apiGet(`/api/biblioteca/cartas?${params}`);
}

export function listarSets() {
  return apiGet('/api/biblioteca/sets');
}
