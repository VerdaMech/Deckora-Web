import { Card } from '@/components/ui';

export default function PlaceholderPage({ name, route }) {
  return (
    <Card>
      <h1 className="font-h1 placeholder-page__title">{name}</h1>
      <p className="font-body placeholder-page__meta">
        Ruta: <code>{route}</code>
      </p>
      <p className="font-small placeholder-page__note">
        Esta página todavía no fue implementada. Forma parte del routing skeleton de la Fase 1.
      </p>
    </Card>
  );
}
