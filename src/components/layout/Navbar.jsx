import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Dropdown, Offcanvas } from 'react-bootstrap';
import { Menu, LogOut, User, Settings } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';

function getInitials(user) {
  const name = user?.nombre_usuario ?? user?.email ?? '?';
  return name.slice(0, 2).toUpperCase();
}

export default function Navbar() {
  const { user, rol, logout } = useAuth();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const username = user?.nombre_usuario ?? user?.email?.split('@')[0] ?? '';

  const publicLinks = (
    <>
      <li><NavLink to="/torneos" className="navbar-link">Torneos</NavLink></li>
    </>
  );

  const authLinks = (
    <>
      <li><NavLink to="/torneos" className="navbar-link">Torneos</NavLink></li>
      <li><NavLink to={`/${rol}`} className="navbar-link">Mi panel</NavLink></li>
    </>
  );

  return (
    <nav className="navbar-deckora">
      <Link to="/" className="navbar-logo">DECKORA</Link>

      <ul className="navbar-links">
        {user ? authLinks : publicLinks}
      </ul>

      <div className="navbar-actions">
        {user ? (
          <Dropdown align="end">
            <Dropdown.Toggle as="div" bsPrefix="none">
              <div className="navbar-avatar">{getInitials(user)}</div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-deckora">
              <Dropdown.Item as={Link} to={`/u/${username}`} className="dropdown-item-deckora">
                <User size={14} /> Perfil
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/configuracion" className="dropdown-item-deckora">
                <Settings size={14} /> Configuración
              </Dropdown.Item>
              <Dropdown.Divider className="dropdown-divider-deckora" />
              <Dropdown.Item onClick={logout} className="dropdown-item-deckora dropdown-item-deckora--danger">
                <LogOut size={14} /> Cerrar sesión
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <>
            <Button variant="ghost" size="sm" as={Link} to="/login">Iniciar sesión</Button>
            <Button variant="primary" size="sm" as={Link} to="/registro">Crear cuenta</Button>
          </>
        )}

        <button
          className="navbar-hamburger d-lg-none"
          onClick={() => setShowOffcanvas(true)}
          aria-label="Menú"
        >
          <Menu size={22} />
        </button>
      </div>

      <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end" className="offcanvas-deckora">
        <Offcanvas.Header closeButton className="offcanvas-header-deckora">
          <Offcanvas.Title className="navbar-logo">DECKORA</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ul className="offcanvas-nav">
            {user ? authLinks : publicLinks}
          </ul>
          {!user && (
            <div className="offcanvas-nav-actions">
              <Button variant="ghost" as={Link} to="/login" onClick={() => setShowOffcanvas(false)}>Iniciar sesión</Button>
              <Button variant="primary" as={Link} to="/registro" onClick={() => setShowOffcanvas(false)}>Crear cuenta</Button>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </nav>
  );
}
