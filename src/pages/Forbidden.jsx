import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export default function Forbidden() {
  return (
    <div className="error-page">
      <h1 className="error-page__code error-page__code--403">403</h1>
      <h2 className="font-h2">Acceso denegado</h2>
      <p className="font-body-lg error-page__desc">
        No tenés los permisos necesarios para ver esta sección. Verificá tu rol en Deckora.
      </p>
      <Button variant="ghost" as={Link} to="/">Volver al inicio</Button>
    </div>
  );
}
