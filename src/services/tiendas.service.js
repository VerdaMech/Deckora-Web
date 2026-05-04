import { apiPut } from './api';

export async function actualizarMiTienda(id, data) {
  try {
    return await apiPut(`/tiendas/${id}`, data);
  } catch {
    return data; // mock hasta que el endpoint esté disponible
  }
}
