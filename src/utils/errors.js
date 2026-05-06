const SUPABASE_MAP = [
  ['Invalid login credentials', 'El correo o la contraseña son incorrectos.'],
  ['User already registered', 'Ya existe una cuenta con ese correo.'],
  ['Email not confirmed', 'Confirma tu correo antes de iniciar sesión.'],
  ['JWT expired', 'Tu sesión expiró. Inicia sesión nuevamente.'],
  ['Failed to fetch', 'No se pudo conectar al servidor. Revisa tu conexión.'],
  ['NetworkError', 'No se pudo conectar al servidor. Revisa tu conexión.'],
  ['Load failed', 'No se pudo conectar al servidor. Revisa tu conexión.'],
];

const HTTP_MAP = {
  400: 'La información enviada no es válida.',
  401: 'Tu sesión expiró. Inicia sesión nuevamente.',
  403: 'No tienes permiso para hacer esto.',
  404: 'No se encontró lo que buscas.',
  409: 'Esta acción genera un conflicto. Verifica e intenta otra vez.',
  422: 'Los datos no pasaron la validación.',
  429: 'Hiciste muchas peticiones seguidas. Espera unos segundos.',
  500: 'El servidor tuvo un problema. Intenta de nuevo en un momento.',
  502: 'El servidor tuvo un problema. Intenta de nuevo en un momento.',
  503: 'El servidor tuvo un problema. Intenta de nuevo en un momento.',
  504: 'El servidor tuvo un problema. Intenta de nuevo en un momento.',
};

export function traducirError(error) {
  if (!error) return 'Ocurrió un error inesperado. Intenta de nuevo.';

  const status = error?.status ?? error?.statusCode ?? error?.code;
  if (typeof status === 'number' && HTTP_MAP[status]) return HTTP_MAP[status];

  const msg = error?.message ?? (typeof error === 'string' ? error : '');
  for (const [substr, traduccion] of SUPABASE_MAP) {
    if (msg.includes(substr)) return traduccion;
  }

  if (HTTP_MAP[status]) return HTTP_MAP[status];
  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}

const COLD_START_MESSAGES = ['Service Unavailable', 'upstream connect error', 'upstream request timeout'];

export function esColdStart(error) {
  if (!error) return false;
  const status = error?.status ?? error?.statusCode;
  if (status === 503 || status === 504) return true;
  const msg = error?.message ?? '';
  return COLD_START_MESSAGES.some((s) => msg.includes(s));
}
