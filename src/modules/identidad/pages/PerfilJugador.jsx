import { useParams } from 'react-router-dom';
import PlaceholderPage from '@/pages/PlaceholderPage';
export default function PerfilJugador() {
  const { username } = useParams();
  return <PlaceholderPage name={`Perfil: ${username}`} route={`/u/${username}`} />;
}
