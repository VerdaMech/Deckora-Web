import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="error-page">
      <h1 className="error-page__code error-page__code--404">404</h1>
      <h2 className="font-h2">Página no encontrada</h2>
      <p className="font-body-lg error-page__desc">
        La ruta que buscás no existe en Deckora. Puede que el hechizo haya fallado.
      </p>
      <Button variant="primary" as={Link} to="/">Volver al inicio</Button>
    </div>
  );
}
