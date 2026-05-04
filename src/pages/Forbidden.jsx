import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export default function Forbidden() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 'var(--space-4)', padding: 'var(--space-7)' }}>
      <h1 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '5rem', fontWeight: 900, color: 'var(--crimson)', lineHeight: 1, margin: 0 }}>403</h1>
      <h2 className="font-h2" style={{ color: 'var(--text-primary)' }}>Acceso denegado</h2>
      <p className="font-body-lg" style={{ color: 'var(--text-muted)', maxWidth: '40ch' }}>
        No tenés los permisos necesarios para ver esta sección. Verificá tu rol en Deckora.
      </p>
      <Button variant="ghost" as={Link} to="/">Volver al inicio</Button>
    </div>
  );
}
