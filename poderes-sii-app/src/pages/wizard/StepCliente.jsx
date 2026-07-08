import Combobox from '../../components/Combobox';
import Icon from '../../components/Icon';
import { CLIENTES, FORMA_ACTUACION_LABELS, getCliente } from '../../data/clientes';
import { usePoderesStore, trackKey } from '../../store/PoderesStoreContext';
import { donDona, fechaCortaFromISO } from '../../utils/text';
import { useWizard } from './WizardContext';

export default function StepCliente() {
  const { wizard, selectCliente, attempted } = useWizard();
  const { vigenteFor } = usePoderesStore();
  const cliente = getCliente(wizard.clienteId);

  return (
    <>
      <h3 style={{ marginTop: 0 }}>3. Selección de cliente</h3>
      <div className={`field${attempted && !wizard.clienteId ? ' invalid' : ''}`}>
        <label className="field-label">Cliente (CRM / Centro de Comandos) *</label>
        <Combobox
          items={CLIENTES}
          getLabel={(c) => c.razonSocial}
          getSub={(c) => c.rut}
          placeholder="Buscar cliente por razón social o RUT..."
          initialLabel={cliente ? cliente.razonSocial : ''}
          onSelect={(c) => selectCliente(c)}
        />
        <div className="field-hint">Al seleccionar, se autocompletan los datos de la sociedad y sus representantes legales.</div>
        <div className="field-error">Este campo es obligatorio.</div>
      </div>

      {cliente && (
        <div className="summary-box">
          <dl className="summary-grid">
            <div><dt>Razón social</dt><dd>{cliente.razonSocial}</dd></div>
            <div><dt>RUT empresa</dt><dd>{cliente.rut}</dd></div>
            <div><dt>Giro</dt><dd>{cliente.giro}</dd></div>
            <div><dt>Domicilio</dt><dd>{cliente.domicilio}</dd></div>
            <div><dt>Comuna</dt><dd>{cliente.comuna}</dd></div>
            <div><dt>Ciudad / Región</dt><dd>{cliente.ciudad} · {cliente.region}</dd></div>
          </dl>
          <div className="rep-list" style={{ marginTop: 14 }}>
            {cliente.representantes.map((r) => (
              <div className="rep-row locked" key={r.id}>
                <span className="rep-name">{donDona(r.genero)} {r.nombre}</span>
                <span className="rep-rut">{r.rut}</span>
              </div>
            ))}
          </div>
          <div className="field-hint" style={{ marginTop: 8 }}>
            Forma de actuación: <b>{FORMA_ACTUACION_LABELS[cliente.formaActuacion]}</b>
          </div>
        </div>
      )}

      {cliente && wizard.tipoMandante === 'juridica' && !wizard.forceNewVersion && (() => {
        const vigente = vigenteFor(cliente.id, trackKey('juridica'));
        if (!vigente) return null;
        return (
          <div className="banner banner-info">
            <Icon name="info" />
            <div>
              Este cliente ya tiene un Poder SII vigente <b>como persona jurídica</b> (v{vigente.version}, {fechaCortaFromISO(vigente.fechaISO)},
              creado por {vigente.usuario}). Podrás revisarlo o generar una nueva versión al finalizar. Esto no afecta a poderes de personas naturales
              asociadas a este mismo cliente, que se gestionan de forma independiente.
            </div>
          </div>
        );
      })()}

      {cliente && wizard.tipoMandante === 'natural' && (
        <div className="banner banner-info">
          <Icon name="info" />
          <div>
            Para personas naturales, la validación de poder duplicado se hace según la persona específica que selecciones en el siguiente paso,
            de forma independiente del poder de la empresa.
          </div>
        </div>
      )}
    </>
  );
}
