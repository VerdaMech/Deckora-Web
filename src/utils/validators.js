export const validarEmail = (valor) =>
  (valor && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(valor)) || 'Ingresa un correo válido.';

export const validarPasswordMin = (min = 8) => (valor) =>
  (valor?.length >= min) || `Mínimo ${min} caracteres.`;

export const validarRequerido = (valor) =>
  (valor?.toString().trim().length > 0) || 'Este campo es requerido.';

export const validarFechaFutura = (valor) =>
  (new Date(valor) > new Date()) || 'La fecha debe ser futura.';

export const validarUrl = (valor) =>
  !valor || /^https?:\/\/.+/.test(valor) || 'URL inválida (debe empezar con http o https).';

