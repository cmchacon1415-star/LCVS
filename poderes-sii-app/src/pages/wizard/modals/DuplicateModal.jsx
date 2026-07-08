import Modal from '../../../components/Modal';
import { fechaCortaFromISO } from '../../../utils/text';

export default function DuplicateModal({ clienteNombre, trackLabelText, vigente, onCancelar, onVerAnterior, onNuevaVersion }) {
  return (
    <Modal onClose={onCancelar}>
      <h3>Ya existe un Poder SII para este cliente</h3>
      <p>
        Ya existe un Poder SII vigente ({trackLabelText}) para <b>{clienteNombre}</b> con fecha {fechaCortaFromISO(vigente.fechaISO)},
        creado por {vigente.usuario}. Puedes cancelar, ver el poder anterior o generar una nueva versión.
      </p>
      <div className="modal-actions">
        <button className="btn btn-primary" onClick={onNuevaVersion}>Generar nueva versión</button>
        <button className="btn btn-secondary" onClick={onVerAnterior}>Ver poder anterior</button>
        <button className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
      </div>
    </Modal>
  );
}
