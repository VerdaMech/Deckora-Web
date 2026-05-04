import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export default function Landing() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 'var(--space-5)', padding: 'var(--space-7)' }}>
      <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '4rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1.1, margin: 0 }}>
        DECKORA
      </h1>
      <p className="font-body-lg" style={{ color: 'var(--text-muted)', maxWidth: '48ch' }}>
        La plataforma de Magic: The Gathering para la comunidad Commander. Gestiona tus mazos, participa en torneos y conecta con tiendas locales.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="primary-clip" size="lg" as={Link} to="/registro">Crear cuenta</Button>
        <Button variant="ghost" size="lg" as={Link} to="/torneos">Ver torneos</Button>
      </div>
      <p className="font-small" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-4)', opacity: 0.6 }}>
        Landing — placeholder Fase 1 · Se implementa en Fase 5
      </p>
    </div>
  );
}
