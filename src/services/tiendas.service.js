import { apiGet, apiPut } from './api';

export async function listarTiendas() {
  try {
    const data = await apiGet('/tiendas');
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

export async function listarTiendasCercanas({ lat, lng, radio }) {
  try {
    const data = await apiGet(`/tiendas/cercanas?lat=${lat}&lng=${lng}&radio=${radio}`);
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

export async function obtenerTienda(id) {
  try {
    const data = await apiGet(`/tiendas/${id}`);
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

export async function listarTorneosDeTienda(id) {
  try {
    const data = await apiGet(`/tiendas/${id}/torneos`);
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e.message };
  }
}

export async function actualizarMiTienda(id, data) {
  try {
    return await apiPut(`/tiendas/${id}`, data);
  } catch {
    return data;
  }
}
