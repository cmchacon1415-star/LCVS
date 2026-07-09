import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function GestionDocumental() {
  return (
    <>
      <h1 className="page-title">Gestión Documental</h1>
      <p className="page-subtitle">Módulo para la administración de documentos y poderes de representación.</p>
      <div className="big-cards">
        <Link className="big-card" to="/gestion-documental/poderes-sii">
          <div className="icon-wrap"><Icon name="fileText" /></div>
          <h3>Poderes SII</h3>
          <p>Generación y administración de Poderes SII a partir de la información de clientes y mandatarios de Sur Consulting.</p>
        </Link>
      </div>
    </>
  );
}
