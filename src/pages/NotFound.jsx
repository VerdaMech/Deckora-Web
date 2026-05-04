import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 'var(--space-4)', padding: 'var(--space-7)' }}>
      <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '6rem', fontWeight: 900, color: 'var(--gold)', lineHeight: 1, margin: 0 }}>404</h1>
      <h2 className="font-h2" style={{ color: 'var(--text-primary)' }}>Página no encontrada</h2>
      <p className="font-body-lg" style={{ color: 'var(--text-muted)', maxWidth: '40ch' }}>
        La ruta que buscás no existe en Deckora. Puede que el hechizo haya fallado.
      </p>
      <Button variant="primary" as={Link} to="/">Volver al inicio</Button>
    </div>
  );
}
