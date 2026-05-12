import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import './NotFound.css';

function CartaSVG() {
  return (
    <svg className="error-page-svg" viewBox="0 0 120 168" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="112" height="160" rx="8" fill="#160e16" stroke="rgba(201,168,76,0.35)" strokeWidth="2"/>
      <rect x="10" y="10" width="100" height="148" rx="5" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1"/>
      <text x="60" y="95" textAnchor="middle" dominantBaseline="middle" fontSize="48" fill="rgba(201,168,76,0.6)" fontFamily="serif">?</text>
      <rect x="4" y="4" width="112" height="160" rx="8" fill="none" stroke="rgba(201,168,76,0.55)" strokeWidth="2"/>
    </svg>
  );
}

export default function NotFound() {
  const { user, rol } = useAuth();

  const panelLink = rol === 'jugador' ? '/jugador' : rol === 'organizador' ? '/organizador' : rol === 'tienda' ? '/tienda' : null;

  return (
    <div className="error-page-404">
      <div className="error-page-404__grain" aria-hidden="true" />
      <CartaSVG />
      <h1 className="error-page-404__titulo">404 — Esta carta no está en el grimorio</h1>
      <p className="error-page-404__mensaje">La página que buscas no existe o fue movida.</p>
      <div className="error-page-404__acciones">
        <Link to="/" className="btn btn--primary btn--md">Volver al inicio</Link>
        {user && panelLink ? (
          <Link to={panelLink} className="btn btn--secondary btn--md">Mi panel</Link>
        ) : (
          <Link to="/login" className="btn btn--secondary btn--md">Iniciar sesión</Link>
        )}
      </div>
    </div>
  );
}
