import { User, Calendar, Store } from 'lucide-react';
import './ProfilesLanding.css';

const ROLES = [
  {
    icono: User,
    nombre: 'Jugador',
    clase: 'profiles-landing__card--jugador',
    bullets: [
      'Crea y comparte mazos de Magic',
      'Lleva registro de tu colección',
      'Inscríbete en torneos locales',
      'Consulta tus estadísticas de partidas',
    ],
  },
  {
    icono: Calendar,
    nombre: 'Organizador',
    clase: 'profiles-landing__card--organizador',
    bullets: [
      'Crea y gestiona torneos',
      'Administra inscripciones y rondas',
      'Reporta resultados de partidas',
      'Gestiona standings en tiempo real',
    ],
  },
  {
    icono: Store,
    nombre: 'Tienda',
    clase: 'profiles-landing__card--tienda',
    bullets: [
      'Aparece en el mapa de tiendas',
      'Organiza torneos en tu local',
      'Conecta con jugadores de tu zona',
      'Configura tu perfil de tienda',
    ],
  },
];

export default function ProfilesLanding() {
  return (
    <section className="profiles-landing">
      <h2 className="profiles-landing__titulo">¿Cuál es tu rol?</h2>
      <p className="profiles-landing__subtitulo">
        Deckora se adapta a cómo participas en la comunidad de Commander.
      </p>
      <div className="profiles-landing__grid">
        {ROLES.map(({ icono: Icono, nombre, clase, bullets }) => (
          <div key={nombre} className={`profiles-landing__card ${clase}`}>
            <div className="profiles-landing__card-header">
              <Icono size={28} strokeWidth={1.5} className="profiles-landing__card-icono" />
              <h3 className="profiles-landing__card-nombre">{nombre}</h3>
            </div>
            <ul className="profiles-landing__card-bullets">
              {bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
