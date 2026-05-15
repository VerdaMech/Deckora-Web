import { Outlet } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

/**
 * @param {{ withSidebar?: boolean }} props
 */
export default function AppLayout({ withSidebar = false }) {
  const { user } = useAuth();
  const showSidebar = withSidebar && !!user;

  return (
    <div className="app-layout">
      <Navbar />
      {showSidebar && <Sidebar />}
      <main className={`app-layout__main${showSidebar ? ' app-layout__main--with-sidebar' : ''}`}>
        <div className="app-layout__content">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
