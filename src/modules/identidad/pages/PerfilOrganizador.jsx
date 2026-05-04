import { useEffect, useState } from 'react';
import { Globe, Swords } from 'lucide-react';

import { Card, EmptyState, Tabs } from '@/components/ui';
import RoleBadge from '@/components/domain/RoleBadge';
import { useAuth } from '@/hooks/useAuth';
import { obtenerTorneosDeUsuario } from '@/services/usuarios.service';

function getInitials(nombre) {
  return (nombre ?? '?').substring(0, 2).toUpperCase();
}

export default function PerfilOrganizador({ perfil }) {
  const { user } = useAuth();
  const esDueno = user && user.id === perfil.id;
  const [torneos, setTorneos] = useState([]);

  useEffect(() => {
    obtenerTorneosDeUsuario(perfil.id, 'organizador').then(setTorneos);
  }, [perfil.id]);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header__avatar">{getInitials(perfil.nombre_usuario)}</div>
        <div className="profile-header__info">
          <h1 className="profile-header__name">{perfil.nombre_usuario}</h1>
          <div className="profile-header__role">
            <RoleBadge rol={perfil.rol} />
          </div>
        </div>
      </div>

      <div className="profile-body">
        {esDueno && (
          <div className="profile-edit-banner">
            <span>Administrá tu perfil de organizador</span>
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
                <div className="profile-mis-torneos">
                  <a href="/organizador/torneos/nuevo" className="btn btn--primary btn--sm">
                    Crear torneo
                  </a>
                  {torneos.map((t) => (
                    <Card key={t.id} variant="interactive">
                      <p className="profile-deck__name">{t.nombre}</p>
                      <p className="profile-deck__meta">{t.formato} · {t.fecha} · {t.estado}</p>
                    </Card>
                  ))}
                </div>
              </Tabs.Tab>
            </Tabs>
          </section>
        )}
      </div>
    </div>
  );
}
