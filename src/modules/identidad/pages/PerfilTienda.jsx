import { useEffect, useState } from 'react';
import { MapPin, Phone, Clock, Swords } from 'lucide-react';

import { Card, EmptyState, Tabs } from '@/components/ui';
import RoleBadge from '@/components/domain/RoleBadge';
import MiniMapaTienda from '@/components/domain/MiniMapaTienda';
import MisTorneosTab from '../components/MisTorneosTab';
import { useAuth } from '@/hooks/useAuth';
import { obtenerTorneosDeUsuario } from '@/services/usuarios.service';

function getInitials(nombre) {
  return (nombre ?? '?').substring(0, 2).toUpperCase();
}

export default function PerfilTienda({ perfil }) {
  const { user } = useAuth();
  const esDueno = user && user.id === perfil.id;
  const [torneos, setTorneos] = useState([]);
  const nombreDisplay = perfil.nombre_tienda ?? perfil.nombre_usuario;

  useEffect(() => {
    obtenerTorneosDeUsuario(perfil.id).then(setTorneos).catch(() => setTorneos([]));
  }, [perfil.id]);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header__avatar">{getInitials(nombreDisplay)}</div>
        <div className="profile-header__info">
          <h1 className="profile-header__name">{nombreDisplay}</h1>
          <div className="profile-header__role">
            <RoleBadge rol={perfil.rol} />
          </div>
        </div>
      </div>

      <div className="profile-body">
        {esDueno && (
          <div className="profile-edit-banner">
            <span>Administra los datos de tu tienda</span>
            <a href="/configuracion?tab=tienda" className="btn btn--secondary btn--sm">
              Editar mi tienda
            </a>
          </div>
        )}

        <section className="profile-section">
          <h3 className="profile-section__title">Información</h3>
          <ul className="profile-info-list">
            {perfil.direccion && (
              <li><MapPin size={16} />{perfil.direccion}</li>
            )}
            {perfil.numero_telefono && (
              <li><Phone size={16} />{perfil.numero_telefono}</li>
            )}
            {perfil.horario_apertura && (
              <li><Clock size={16} />{perfil.horario_apertura}</li>
            )}
          </ul>
        </section>

        {perfil.latitud != null && perfil.longitud != null && (
          <MiniMapaTienda tienda={perfil} />
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
              description="Esta tienda no ha publicado torneos."
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
