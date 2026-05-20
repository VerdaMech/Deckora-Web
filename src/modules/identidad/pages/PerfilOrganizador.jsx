import { useEffect, useState } from 'react';
import { Globe, Swords } from 'lucide-react';

import { Card, EmptyState, Tabs } from '@/components/ui';
import MisTorneosTab from '../components/MisTorneosTab';
import { useAuth } from '@/hooks/useAuth';
import { obtenerTorneosDeUsuario } from '@/services/usuarios.service';
import ProfileHeader from '../components/ProfileHeader';

export default function PerfilOrganizador({ perfil }) {
  const { user } = useAuth();
  const esDueno = user && user.id === perfil.id;
  const [torneos, setTorneos] = useState([]);

  useEffect(() => {
    obtenerTorneosDeUsuario(perfil.id).then(setTorneos).catch(() => setTorneos([]));
  }, [perfil.id]);

  return (
    <div className="profile-page">
      <ProfileHeader nombre={perfil.nombre_usuario} rol={perfil.rol} />

      <div className="profile-body">
        {esDueno && (
          <div className="profile-edit-banner">
            <span>Administra tu perfil de organizador</span>
            <a href="/configuracion" className="btn btn--secondary btn--sm">Editar perfil</a>
          </div>
        )}

        {(perfil.descripcion || perfil.sitio_web) && (
          <section className="profile-section">
            <h3 className="profile-section__title">Acerca de</h3>
            {perfil.descripcion && (
              <p className="profile-descripcion">{perfil.descripcion}</p>
            )}
            {perfil.sitio_web && (
              <a
                href={perfil.sitio_web}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-sitio-web"
              >
                <Globe size={16} />
                {perfil.sitio_web}
              </a>
            )}
          </section>
        )}

        <section className="profile-section">
          <h3 className="profile-section__title">Torneos publicados</h3>
          {torneos.length > 0 ? (
            <div className="profile-torneos-grid">
              {torneos.map((t) => (
                <Card key={t.id} variant="default">
                  <p className="profile-deck__name">{t.nombre}</p>
                  <p className="profile-deck__meta">{t.formato} · {t.fecha}</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Swords}
              title="Sin torneos"
              description="Este organizador no ha publicado torneos."
            />
          )}
        </section>

        {esDueno && (
          <section className="profile-section">
            <Tabs>
              <Tabs.Tab eventKey="mis-torneos" label="Mis torneos">
                <MisTorneosTab />
              </Tabs.Tab>
            </Tabs>
          </section>
        )}
      </div>
    </div>
  );
}
