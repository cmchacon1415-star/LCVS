import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function Home() {
  return (
    <>
      <h1 className="page-title">Bienvenido, Usuario Demo</h1>
      <p className="page-subtitle">Plataforma de Personas · Sur Consulting</p>
      <div className="card" style={{ borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div className="icon-wrap" style={{ background: '#fff', color: 'var(--primary-dark)', flexShrink: 0 }}>
            <Icon name="folder" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: 15 }}>Nuevo módulo disponible: Gestión Documental</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13.5, color: '#1e3a8a' }}>
              Prototipo de presentación. Haz clic en el ícono de carpeta de la barra lateral (justo debajo de
              Personas) para explorar la generación automática de Poderes SII.
            </p>
            <Link className="btn btn-primary" to="/gestion-documental">
              <Icon name="folder" /> Ir a Gestión Documental
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
