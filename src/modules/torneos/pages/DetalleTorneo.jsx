import { useParams } from 'react-router-dom';
import PlaceholderPage from '@/pages/PlaceholderPage';
export default function DetalleTorneo() {
  const { id } = useParams();
  return <PlaceholderPage name="Detalle de torneo" route={`/torneos/${id}`} />;
}
