import Icon from '../../components/Icon';
import { CURRENT_USER, FORMA_ACTUACION_LABELS, getCliente, getRepresentante } from '../../data/clientes';
import { usePoderesStore, trackKey } from '../../store/PoderesStoreContext';
import { donDona, fechaCortaFromISO } from '../../utils/text';
import { useWizard } from './WizardContext';

function ObservacionesField({ wizard, update }) {
  return (
    <div className="field" style={{ marginTop: 18 }}>
      <label className="field-label">Observaciones legales (interno, opcional)</label>
      <textarea
        placeholder="Notas internas sobre poderes vigentes, limitaciones o revisiones pendientes. No se imprime en el documento."
        value={wizard.observaciones || ''}
        onChange={(e) => update({ observaciones: e.target.value })}
      />
      <div className="field-hint">Este campo es solo para trazabilidad interna. No aparece en el Poder SII.</div>
    </div>
  );
}

function NaturalPersonSelector() {
  const { wizard, update, attempted } = useWizard();
  const { vigenteFor } = usePoderesStore();
  const cliente = getCliente(wizard.clienteId);
  const vigente = wizard.naturalPersonId && !wizard.forceNewVersion
    ? vigenteFor(cliente.id, trackKey('natural', wizard.naturalPersonId))
    : null;

  return (
    <>
      <h3 style={{ marginTop: 0 }}>4. Persona natural mandante</h3>
      <p className="field-hint" style={{ marginBottom: 14 }}>
        Selecciona, desde los representantes del cliente, a la persona natural que actuará como mandante.
      </p>
      <div className="rep-list">
        {cliente.representantes.map((r) => (
          <label className="rep-row" key={r.id}>
            <input
              type="radio"
              name="natural-rep"
              value={r.id}
              checked={wizard.naturalPersonId === r.id}
              onChange={() => update({ naturalPersonId: r.id })}
            />
            <span className="rep-name">{donDona(r.genero)} {r.nombre}</span>
            <span className="rep-rut">{r.rut}</span>
          </label>
        ))}
      </div>
      {attempted && !wizard.naturalPersonId && (
        <div className="field-error" style={{ display: 'block', marginTop: 8 }}>Debes seleccionar una persona natural mandante.</div>
      )}
      {vigente && (
        <div className="banner banner-info">
          <Icon name="info" />
          <div>
            Ya existe un Poder SII vigente para esta persona natural (v{vigente.version}, {fechaCortaFromISO(vigente.fechaISO)},
            creado por {vigente.usuario}). Podrás revisarlo o generar una nueva versión al finalizar.
          </div>
        </div>
      )}
      <ObservacionesField wizard={wizard} update={update} />
    </>
  );
}

function FreeMultiSelect({ cliente, exactCount }) {
  const { wizard, update } = useWizard();
  function toggle(repId) {
    const has = wizard.repsSeleccionados.includes(repId);
    if (has) {
      update({ repsSeleccionados: wizard.repsSeleccionados.filter((id) => id !== repId) });
    } else {
      if (exactCount && wizard.repsSeleccionados.length >= exactCount) return;
      update({ repsSeleccionados: [...wizard.repsSeleccionados, repId] });
    }
  }
  return (
    <div className="rep-list">
      {cliente.representantes.map((r) => (
        <label className="rep-row" key={r.id}>
          <input type="checkbox" checked={wizard.repsSeleccionados.includes(r.id)} onChange={() => toggle(r.id)} />
          <span className="rep-name">{donDona(r.genero)} {r.nombre}</span>
          <span className="rep-rut">{r.rut}</span>
        </label>
      ))}
    </div>
  );
}

function RepSelectionArea({ cliente }) {
  const { wizard, update } = useWizard();
  const { logInternal } = usePoderesStore();
  const forma = cliente.formaActuacion;

  if (forma === 'especial' || forma === 'incompleta') {
    if (!wizard.advertenciaAceptada && !wizard.advertenciaRechazada) {
      return (
        <div className="banner banner-warning">
          <Icon name="alert" />
          <div>
            <div><b>Este cliente tiene una forma de actuación especial o pendiente de validación.</b> Revisar antecedentes antes de generar el poder.</div>
            <div className="banner-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  update({ advertenciaAceptada: true });
                  logInternal({ usuario: CURRENT_USER, cliente: cliente.razonSocial, tipo: 'advertencia', mensaje: 'Advertencia de forma de actuación aceptada por el usuario.' });
                }}
              >
                Entiendo y continuar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  update({ advertenciaRechazada: true });
                  logInternal({ usuario: CURRENT_USER, cliente: cliente.razonSocial, tipo: 'advertencia', mensaje: 'Advertencia de forma de actuación rechazada por el usuario.' });
                }}
              >
                Rechazo
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (wizard.advertenciaRechazada) {
      return (
        <div className="banner banner-danger">
          <Icon name="x" />
          <div>
            Selección rechazada. Vuelve al paso anterior y elige otro cliente, o revisa los antecedentes antes de continuar.
            <div className="banner-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => update({ advertenciaRechazada: false })}>Revisar de nuevo</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <>
        <div className="banner banner-info">
          <Icon name="info" />
          <div>Advertencia aceptada. Selecciona libremente uno o más representantes.</div>
        </div>
        <FreeMultiSelect cliente={cliente} />
      </>
    );
  }

  if (forma === 'unico') {
    const r = cliente.representantes[0];
    return (
      <>
        <div className="rep-list">
          <div className="rep-row locked">
            <input type="checkbox" checked disabled readOnly />
            <span className="rep-name">{donDona(r.genero)} {r.nombre}</span>
            <span className="rep-rut">{r.rut}</span>
          </div>
        </div>
        <div className="field-hint" style={{ marginTop: 8 }}>Representante único: seleccionado automáticamente.</div>
      </>
    );
  }

  if (forma === 'indistinta') {
    return (
      <>
        <FreeMultiSelect cliente={cliente} />
        <div className="field-hint" style={{ marginTop: 8 }}>Cualquiera puede actuar indistintamente. Selecciona uno o más.</div>
      </>
    );
  }

  if (forma === 'conjunta') {
    return (
      <>
        <div className="rep-list">
          {cliente.representantes.map((r) => (
            <div className="rep-row locked" key={r.id}>
              <input type="checkbox" checked disabled readOnly />
              <span className="rep-name">{donDona(r.genero)} {r.nombre}</span>
              <span className="rep-rut">{r.rut}</span>
            </div>
          ))}
        </div>
        <div className="field-hint" style={{ marginTop: 8 }}>Actuación conjunta: se requiere la firma de todos los representantes.</div>
      </>
    );
  }

  if (forma === 'dos_de_n') {
    return (
      <>
        <FreeMultiSelect cliente={cliente} exactCount={cliente.minRequeridos || 2} />
        <div className="field-hint" style={{ marginTop: 8 }}>Selecciona exactamente {cliente.minRequeridos || 2} representantes.</div>
      </>
    );
  }

  if (forma === 'grupos') {
    return cliente.gruposActuacion.map((g) => (
      <div style={{ marginBottom: 14 }} key={g.nombre}>
        <div className="field-label" style={{ marginBottom: 8 }}>{g.nombre} (seleccione 1)</div>
        <div className="rep-list">
          {g.repIds.map((id) => {
            const r = getRepresentante(cliente, id);
            return (
              <label className="rep-row" key={id}>
                <input
                  type="radio"
                  name={`grupo-${g.nombre.replace(/\s+/g, '')}`}
                  checked={wizard.repsGrupo[g.nombre] === id}
                  onChange={() => update({ repsGrupo: { ...wizard.repsGrupo, [g.nombre]: id } })}
                />
                <span className="rep-name">{donDona(r.genero)} {r.nombre}</span>
                <span className="rep-rut">{r.rut}</span>
              </label>
            );
          })}
        </div>
      </div>
    ));
  }

  return null;
}

export default function StepRepresentantes() {
  const { wizard, update } = useWizard();
  const cliente = getCliente(wizard.clienteId);

  if (!cliente) {
    return (
      <div className="banner banner-warning">
        <Icon name="alert" />
        <div>Selecciona primero un cliente en el paso anterior.</div>
      </div>
    );
  }

  if (wizard.tipoMandante === 'natural') return <NaturalPersonSelector />;

  return (
    <>
      <h3 style={{ marginTop: 0 }}>4. Forma de actuación de representantes legales</h3>
      <div className="summary-box" style={{ marginTop: 0, marginBottom: 14 }}>
        <dt style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Forma de actuación registrada</dt>
        <dd style={{ fontWeight: 600 }}>{FORMA_ACTUACION_LABELS[cliente.formaActuacion]}</dd>
      </div>
      <RepSelectionArea cliente={cliente} />
      <ObservacionesField wizard={wizard} update={update} />
    </>
  );
}
