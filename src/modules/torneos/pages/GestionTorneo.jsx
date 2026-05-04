import { useParams } from 'react-router-dom';
import PlaceholderPage from '@/pages/PlaceholderPage';
export default function GestionTorneo() {
  const { id } = useParams();
  return <PlaceholderPage name="Gestión de torneo en vivo" route={`/organizador/torneos/${id}/gestion`} />;
}
