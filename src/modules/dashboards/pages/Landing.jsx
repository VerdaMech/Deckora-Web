import HeroLanding from '../components/HeroLanding';
import FeaturesLanding from '../components/FeaturesLanding';
import ProfilesLanding from '../components/ProfilesLanding';
import CTALanding from '../components/CTALanding';
import SeccionMapaTiendas from '@/modules/mapa/components/SeccionMapaTiendas';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      <HeroLanding />
      <FeaturesLanding />
      <ProfilesLanding />
      <SeccionMapaTiendas />
      <CTALanding />
    </div>
  );
}
