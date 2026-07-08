import { useEffect, useState } from 'react';
import Icon from '../Icon';
import { blobFromBase64Pdf, triggerDownload } from '../../utils/pdf';

// Visor de PDF embebido en la propia app (en vez de window.open a una pestaña
// nueva): funciona igual dentro de vistas previas embebidas o navegadores que
// bloquean ventanas emergentes, y deja "Descargar" siempre a un clic.
export default function PdfViewerModal({ title, base64, fileName, onClose }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blobFromBase64Pdf(base64));
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [base64]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal pdf-viewer-modal">
        <div className="pdf-viewer-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => url && triggerDownload(blobFromBase64Pdf(base64), fileName)}>
              <Icon name="download" /> Descargar
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <Icon name="x" /> Cerrar
            </button>
          </div>
        </div>
        <div className="pdf-viewer-body">
          {url ? (
            <iframe src={url} title={title} className="pdf-viewer-frame" />
          ) : (
            <div className="empty-state"><p>Cargando documento...</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
