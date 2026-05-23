import { Layers, Swords, Store, Sparkles } from 'lucide-react';
import './FeaturesLanding.css';

const FEATURES = [
  {
    icono: Layers,
    titulo: 'Gestiona tus mazos',
    descripcion: 'Construye, valida y comparte mazos de Commander con estadísticas detalladas.',
  },
  {
    icono: Swords,
    titulo: 'Compite en torneos',
    descripcion: 'Encuentra eventos cerca tuyo, inscríbete y registra tus partidas.',
  },
  {
    icono: Store,
    titulo: 'Apoya tu tienda local',
    descripcion: 'Conecta con la comunidad y descubre tiendas de tu zona en el mapa.',
  },
  {
    icono: Sparkles,
    titulo: 'Asistente IA',
    descripcion: 'Recomendaciones inteligentes para mejorar tus mazos.',
  },
];

export default function FeaturesLanding() {
  return (
    <section className="features-landing">
      <h2 className="features-landing__titulo">Todo lo que necesitas</h2>
      <div className="features-landing__grid">
        {FEATURES.map(({ icono: Icono, titulo, descripcion }) => (
          <div key={titulo} className="features-landing__item">
            <div className="features-landing__icono-wrap">
              <Icono size={32} strokeWidth={1.5} className="features-landing__icono" />
            </div>
            <h3 className="features-landing__item-titulo">
              {titulo}
            </h3>
            <p className="features-landing__item-desc">{descripcion}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
