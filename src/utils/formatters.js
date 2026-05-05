export function relativeDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} h`;
  if (days < 7) return `hace ${days} día${days !== 1 ? 's' : ''}`;
  if (weeks < 4) return `hace ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  if (months < 12) return `hace ${months} mes${months !== 1 ? 'es' : ''}`;
  return `hace ${years} año${years !== 1 ? 's' : ''}`;
}

export function formatDate(dateString, options = {}) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function formatNumber(n) {
  return new Intl.NumberFormat('es-CL').format(n);
}
