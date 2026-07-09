import { MANDATARIOS, getMandatario } from '../../data/clientes';
import { buildPersonListText } from '../../utils/text';
import { useWizard } from './WizardContext';

export default function StepMandatarios() {
  const { wizard, update, attempted } = useWizard();

  function toggle(id) {
    const has = wizard.mandatariosSeleccionados.includes(id);
    update({
      mandatariosSeleccionados: has
        ? wizard.mandatariosSeleccionados.filter((x) => x !== id)
        : [...wizard.mandatariosSeleccionados, id],
    });
  }

  const seleccionados = wizard.mandatariosSeleccionados.map(getMandatario);

  return (
    <>
      <h3 style={{ marginTop: 0 }}>5. Mandatarios de Sur Consulting</h3>
      <div className={`field${attempted && !wizard.mandatariosSeleccionados.length ? ' invalid' : ''}`}>
        <label className="field-label">Selecciona uno o varios mandatarios *</label>
        <div className="checklist">
          {MANDATARIOS.map((m) => (
            <label className="checklist-item" key={m.id}>
              <input type="checkbox" checked={wizard.mandatariosSeleccionados.includes(m.id)} onChange={() => toggle(m.id)} />
              <span className="name">{m.nombre}</span>
              <span className="meta">{m.rut} · {m.cargo}</span>
            </label>
          ))}
        </div>
        <div className="field-hint">El cargo interno es solo referencial y no aparece en el documento final.</div>
        <div className="field-error">Este campo es obligatorio.</div>
      </div>
      <div className="chip-row">
        {seleccionados.map((m) => (
          <span className="chip" key={m.id}>
            {m.nombre}
            <button onClick={() => toggle(m.id)} aria-label={`Quitar ${m.nombre}`}>×</button>
          </span>
        ))}
      </div>
      <div className="summary-box">
        <div className="field-label" style={{ marginBottom: 6 }}>Redacción automática del poder</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {seleccionados.length ? buildPersonListText(seleccionados) : 'Selecciona al menos un mandatario para ver la redacción automática.'}
        </div>
      </div>
    </>
  );
}
