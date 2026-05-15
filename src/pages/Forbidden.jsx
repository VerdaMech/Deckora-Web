import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { logout as logoutService } from '@/services/auth.service';
import './Forbidden.css';

function CandadoSVG() {
  return (
    <svg className="forbidden-svg" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="20" y="60" width="80" height="70" rx="8" fill="#160e16" stroke="rgba(201,168,76,0.5)" strokeWidth="2"/>
      <path d="M40 60V44C40 31.85 50.75 22 64 22C77.25 22 88 31.85 88 44V60" stroke="rgba(201,168,76,0.5)" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="60" cy="92" r="10" fill="none" stroke="rgba(201,168,76,0.8)" strokeWidth="2.5"/>
      <line x1="60" y1="100" x2="60" y2="112" stroke="rgba(201,168,76,0.8)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function Forbidden() {
  const { user } = useAuth();

  async function handleLogout() {
    try { await logoutService(); } catch { /* ignorar error al cerrar sesión — la redirección ocurre siempre */ }
    window.location.href = '/login';
  }

  return (
    <div className="forbidden-page">
      <div className="forbidden-page__grain" aria-hidden="true" />
      <CandadoSVG />
      <h1 className="forbidden-page__titulo">403 — No puedes cruzar este umbral</h1>
      <p className="forbidden-page__mensaje">Tu rol no tiene permiso para acceder a esta sección.</p>
      <div className="forbidden-page__acciones">
        <Link to="/" className="btn btn--primary btn--md">Volver al inicio</Link>
        {user && (
          <button className="btn btn--secondary btn--md" onClick={handleLogout}>
            Cerrar sesión
          </button>
        )}
      </div>
    </div>
  );
}
