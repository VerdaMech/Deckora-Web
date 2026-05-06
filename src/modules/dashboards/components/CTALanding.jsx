import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import './CTALanding.css';

export default function CTALanding() {
  const { user } = useAuth();
  if (user) return null;

  return (
    <section className="cta-landing">
      <div className="cta-landing__content">
        <h2 className="cta-landing__titulo">Únete a la mesa</h2>
        <p className="cta-landing__texto">
          Crea tu cuenta gratis y empieza a gestionar tus mazos, competir en torneos y conectar con la comunidad Commander.
        </p>
        <Link to="/registro" className="cta-landing__btn">
          Crear cuenta
        </Link>
      </div>
    </section>
  );
}
