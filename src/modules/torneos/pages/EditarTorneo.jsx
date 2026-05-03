import { useParams } from 'react-router-dom';
import PlaceholderPage from '@/pages/PlaceholderPage';
export default function EditarTorneo() {
  const { id } = useParams();
  return <PlaceholderPage name="Editar torneo" route={`/organizador/torneos/${id}/editar`} />;
}
