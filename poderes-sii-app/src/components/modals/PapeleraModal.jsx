import { useState } from 'react';
import Modal from '../Modal';
import Icon from '../Icon';
import PdfViewerModal from './PdfViewerModal';
import { getCliente } from '../../data/clientes';
import { trackLabel } from '../../store/PoderesStoreContext';
import { fechaCortaFromISO } from '../../utils/text';

export default function PapeleraModal({ eliminados, onRestaurar, onClose }) {
  const [viewing, setViewing] = useState(null);

  return (
    <>
      <Modal onClose={onClose}>
        <h3>Papelera de Poderes SII</h3>
        <p>
          Poderes eliminados lógicamente. No se pierden: puedes revisarlos y restaurarlos en cualquier momento.
          Si al restaurar ya existe una versión vigente más nueva, la restaurada queda como versión archivada.
        </p>
        <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {eliminados.length === 0 && (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <Icon name="trash" />
              <p>La papelera está vacía.</p>
            </div>
          )}
          {eliminados.map((r) => {
            const cliente = getCliente(r.clienteId);
            return (
              <div key={r.id} className="version-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 600 }}>{cliente?.razonSocial}</div>
                <div className="field-hint">{trackLabel(r.tipoMandante, r.naturalPersonNombre)} · Versión {r.version}</div>
                <div className="field-hint">
                  Eliminado el {fechaCortaFromISO(r.eliminadoInfo?.fechaISO)} por {r.eliminadoInfo?.usuario}
                  {r.eliminadoInfo?.motivo ? ` · Motivo: ${r.eliminadoInfo.motivo}` : ''}
                </div>
                <div className="poder-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => setViewing(r)}>
                    <Icon name="eye" /> Ver PDF
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => onRestaurar(r)}>
                    <Icon name="refresh" /> Restaurar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </Modal>

      {viewing && (
        <PdfViewerModal
          title={`Poder SII eliminado · versión ${viewing.version}`}
          base64={viewing.pdfBase64}
          fileName={viewing.fileName}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
