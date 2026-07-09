import { useEffect, useMemo } from 'react';
import Icon from '../Icon';
import DownloadPdfLink from '../DownloadPdfLink';
import PdfCanvasRenderer from '../PdfCanvasRenderer';
import { blobFromBase64Pdf } from '../../utils/pdf';

// Vista previa renderizada con PDF.js sobre <canvas> (no el visor de PDF
// nativo del navegador, que Chromium deshabilita por completo dentro de
// cualquier iframe con sandbox). "Descargar" y "Abrir en pestaña nueva" son
// enlaces <a> reales, no clics disparados por script, para que funcionen en
// contextos que solo permiten descargas/navegación iniciadas directamente
// por el usuario.
export default function PdfViewerModal({ title, base64, fileName, onClose }) {
  const url = useMemo(() => URL.createObjectURL(blobFromBase64Pdf(base64)), [base64]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal pdf-viewer-modal">
        <div className="pdf-viewer-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a className="btn btn-secondary btn-sm" href={url} target="_blank" rel="noopener noreferrer">
              <Icon name="fileText" /> Abrir en pestaña nueva
            </a>
            <DownloadPdfLink base64={base64} fileName={fileName} className="btn btn-secondary btn-sm">
              <Icon name="download" /> Descargar
            </DownloadPdfLink>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>
              <Icon name="x" /> Cerrar
            </button>
          </div>
        </div>
        <div className="pdf-viewer-body">
          <PdfCanvasRenderer base64={base64} />
        </div>
      </div>
    </div>
  );
}
