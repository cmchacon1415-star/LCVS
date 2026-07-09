import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const TOP_ITEMS = [
  { to: '/', icon: 'home', label: 'Inicio', end: true },
  { to: '/adp', icon: 'user', label: 'Personas (ADP)' },
  { to: '/gestion-documental', icon: 'folder', label: 'Gestión Documental', badge: 'NUEVO' },
  { to: '/remuneraciones', icon: 'dollar', label: 'Remuneraciones' },
  { to: '/reportes', icon: 'chart', label: 'Reportes' },
];

export default function Sidebar() {
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">SC</div>
      <div className="sidebar-icons">
        {TOP_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `side-icon${isActive ? ' active' : ''}`}
            title={item.label}
          >
            {item.icon === 'folder' && pulse && <span className="side-pulse" />}
            <Icon name={item.icon} />
            {item.badge && <span className="side-badge">{item.badge}</span>}
            <span className="side-tooltip">{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="sidebar-icons bottom">
        <NavLink to="/config" className={({ isActive }) => `side-icon${isActive ? ' active' : ''}`} title="Configuración">
          <Icon name="gear" />
          <span className="side-tooltip">Configuración</span>
        </NavLink>
      </div>
    </aside>
  );
}
