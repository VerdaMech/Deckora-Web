import { useParams } from 'react-router-dom';
import PlaceholderPage from '@/pages/PlaceholderPage';
export default function DetalleColeccion() {
  const { id } = useParams();
  return <PlaceholderPage name="Detalle de colección" route={`/colecciones/${id}`} />;
}
