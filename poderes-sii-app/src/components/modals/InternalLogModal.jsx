import Modal from '../Modal';
import Icon from '../Icon';

export default function InternalLogModal({ log, onClose }) {
  return (
    <Modal onClose={onClose}>
      <h3>Registro interno de trazabilidad</h3>
      <p>
        Advertencias de forma de actuación y eliminaciones quedan aquí registradas para auditoría interna.
        Esta información no es visible en los documentos generados.
      </p>
      <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {log.length === 0 && (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <Icon name="shield" />
            <p>Aún no hay eventos registrados.</p>
          </div>
        )}
        {log.map((entry) => (
          <div key={entry.id} className="version-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontWeight: 600 }}>{entry.cliente}</div>
            <div>{entry.mensaje}</div>
            {entry.detalle && <div style={{ color: 'var(--text-faint)' }}>Motivo: {entry.detalle}</div>}
            <div style={{ color: 'var(--text-faint)', fontSize: 11.5 }}>
              {new Date(entry.ts).toLocaleString('es-CL')} · {entry.usuario}
            </div>
          </div>
        ))}
      </div>
      <div className="modal-actions" style={{ marginTop: 16 }}>
        <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  );
}
