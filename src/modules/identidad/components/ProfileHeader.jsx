import RoleBadge from '@/components/domain/RoleBadge';
import { getInitials } from '@/utils/formatters';

export default function ProfileHeader({ nombre, rol }) {
  return (
    <div className="profile-header">
      <div className="profile-header__avatar">{getInitials(nombre)}</div>
      <div className="profile-header__info">
        <h1 className="profile-header__name">{nombre}</h1>
        <div className="profile-header__role">
          <RoleBadge rol={rol} />
        </div>
      </div>
    </div>
  );
}
