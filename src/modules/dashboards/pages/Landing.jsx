import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export default function Landing() {
  return (
    <div className="landing-placeholder">
      <h1 className="landing-placeholder__title">DECKORA</h1>
      <p className="font-body-lg landing-placeholder__desc">
        La plataforma de Magic: The Gathering para la comunidad Commander. Gestiona tus mazos, participa en torneos y conecta con tiendas locales.
      </p>
      <div className="landing-placeholder__actions">
        <Button variant="primary-clip" size="lg" as={Link} to="/registro">Crear cuenta</Button>
        <Button variant="ghost" size="lg" as={Link} to="/torneos">Ver torneos</Button>
      </div>
      <p className="font-small landing-placeholder__note">
        Landing — placeholder Fase 1 · Se implementa en Fase 5
      </p>
    </div>
  );
}
