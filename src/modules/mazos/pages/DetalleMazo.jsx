import { useParams } from 'react-router-dom';
import PlaceholderPage from '@/pages/PlaceholderPage';
export default function DetalleMazo() {
  const { id } = useParams();
  return <PlaceholderPage name="Detalle de mazo" route={`/mazos/${id}`} />;
}
