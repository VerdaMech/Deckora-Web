import HeroLanding from '../components/HeroLanding';
import FeaturesLanding from '../components/FeaturesLanding';
import ProfilesLanding from '../components/ProfilesLanding';
import CTALanding from '../components/CTALanding';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing">
      <HeroLanding />
      <FeaturesLanding />
      <ProfilesLanding />
      {/* TODO Commit B3: <SeccionMapaTiendas /> aquí, antes del CTA */}
      <CTALanding />
    </div>
  );
}
