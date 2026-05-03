import { Card } from '@/components/ui';

export default function PlaceholderPage({ name, route }) {
  return (
    <Card>
      <h1 className="font-h1" style={{ color: 'var(--gold)' }}>{name}</h1>
      <p className="font-body" style={{ marginTop: 'var(--space-3)', color: 'var(--text-muted)' }}>
        Ruta: <code>{route}</code>
      </p>
      <p className="font-small" style={{ marginTop: 'var(--space-2)', color: 'var(--text-muted)' }}>
        Esta página todavía no fue implementada. Forma parte del routing skeleton de la Fase 1.
      </p>
    </Card>
  );
}
