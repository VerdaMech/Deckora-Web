import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import './HeroLanding.css';

const DESTINO_POR_ROL = {
  jugador: '/jugador',
  organizador: '/organizador',
  tienda: '/tienda',
};

export default function HeroLanding() {
  const { user, rol } = useAuth();
  const autenticado = !!user;
  const destino = DESTINO_POR_ROL[rol] ?? '/jugador';

  return (
    <section className="hero-landing">
      <div className="hero-landing__grain" aria-hidden="true" />
      <div className="hero-landing__glow" aria-hidden="true" />
      <div className="hero-landing__content">
        <h1 className="hero-landing__wordmark">DECKORA</h1>
        <p className="hero-landing__tagline">
          La plataforma de Magic: The Gathering para la comunidad Commander.
          Gestiona tus mazos, compite en torneos y conecta con tiendas locales.
        </p>
        <div className="hero-landing__acciones">
          {autenticado ? (
            <Link to={destino} className="btn-primary-clip">
              Ir a mi panel
            </Link>
          ) : (
            <>
              <Link to="/registro" className="btn-primary-clip">
                Crear cuenta
              </Link>
              <Link to="/login" className="btn-ghost-hero">
                Iniciar sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
