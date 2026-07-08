import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

function getCrumbs(pathname) {
  if (pathname.startsWith('/gestion-documental/poderes-sii/generar')) {
    return [
      { label: 'Gestión Documental', to: '/gestion-documental' },
      { label: 'Poderes SII', to: '/gestion-documental/poderes-sii' },
      { label: 'Generar Poder SII' },
    ];
  }
  if (pathname.startsWith('/gestion-documental/poderes-sii/generados')) {
    return [
      { label: 'Gestión Documental', to: '/gestion-documental' },
      { label: 'Poderes SII', to: '/gestion-documental/poderes-sii' },
      { label: 'Poderes Generados' },
    ];
  }
  if (pathname.startsWith('/gestion-documental/poderes-sii')) {
    return [{ label: 'Gestión Documental', to: '/gestion-documental' }, { label: 'Poderes SII' }];
  }
  if (pathname.startsWith('/gestion-documental')) return [{ label: 'Gestión Documental' }];
  if (pathname.startsWith('/adp')) return [{ label: 'Personas (ADP)' }];
  if (pathname.startsWith('/remuneraciones')) return [{ label: 'Remuneraciones' }];
  if (pathname.startsWith('/reportes')) return [{ label: 'Reportes' }];
  if (pathname.startsWith('/config')) return [{ label: 'Configuración' }];
  return [{ label: 'Inicio' }];
}

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar crumbs={getCrumbs(pathname)} />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
