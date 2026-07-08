import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function PoderesSiiHome() {
  return (
    <>
      <h1 className="page-title">Poderes SII</h1>
      <p className="page-subtitle">Genera un nuevo Poder SII o revisa los poderes ya generados por cliente.</p>
      <div className="big-cards">
        <Link className="big-card" to="/gestion-documental/poderes-sii/generar">
          <div className="icon-wrap"><Icon name="plusCircle" /></div>
          <h3>Generar nuevo Poder SII</h3>
          <p>Completa un formulario guiado, revisa la vista previa y genera el PDF del poder.</p>
        </Link>
        <Link className="big-card" to="/gestion-documental/poderes-sii/generados">
          <div className="icon-wrap"><Icon name="archive" /></div>
          <h3>Ver Poderes Generados</h3>
          <p>Consulta, descarga o elimina los poderes ya generados, ordenados por cliente.</p>
        </Link>
      </div>
    </>
  );
}
