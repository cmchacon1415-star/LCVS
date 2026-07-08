import { useState } from 'react';
import Modal from '../Modal';

export default function DeleteModal({ clienteNombre, trackLabelText, onCancelar, onConfirmar }) {
  const [motivo, setMotivo] = useState('');
  return (
    <Modal onClose={onCancelar}>
      <h3>¿Eliminar este Poder SII?</h3>
      <p>
        ¿Estás seguro de que deseas eliminar el poder vigente ({trackLabelText}) de <b>{clienteNombre}</b>? Esta acción debe quedar registrada.
        El documento quedará marcado como eliminado y no será visible en la vista principal, conservando trazabilidad interna.
      </p>
      <div className="field" style={{ marginBottom: 4 }}>
        <label className="field-label">Motivo (interno, opcional)</label>
        <textarea placeholder="Ej: generado por error, datos incorrectos..." value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </div>
      <div className="modal-actions" style={{ marginTop: 14 }}>
        <button className="btn btn-danger" onClick={() => onConfirmar(motivo)}>Sí, eliminar</button>
        <button className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
      </div>
    </Modal>
  );
}
