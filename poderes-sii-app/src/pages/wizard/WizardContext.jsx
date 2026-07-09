import { createContext, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getCliente, getMandatario, getRepresentante } from '../../data/clientes';
import { buildDocumentModel } from '../../utils/documentModel';

const TOTAL_STEPS = 6;
export const STEP_LABELS = ['Documento', 'Mandante', 'Cliente', 'Representantes', 'Mandatarios', 'Vista previa'];

function initialWizardState(prefill) {
  const base = {
    ciudadFirma: '', fecha: '', tipoMandante: '', clienteId: '',
    repsSeleccionados: [], repsGrupo: {}, naturalPersonId: '',
    advertenciaAceptada: false, advertenciaRechazada: false, observaciones: '',
    mandatariosSeleccionados: [], forceNewVersion: false,
  };
  if (!prefill?.clienteId) return base;

  const cliente = getCliente(prefill.clienteId);
  const next = { ...base, clienteId: prefill.clienteId, forceNewVersion: !!prefill.forceNewVersion };
  if (prefill.tipoMandante) {
    next.tipoMandante = prefill.tipoMandante;
    if (prefill.tipoMandante === 'juridica' && cliente) {
      if (cliente.formaActuacion === 'unico') next.repsSeleccionados = [cliente.representantes[0].id];
      else if (cliente.formaActuacion === 'conjunta') next.repsSeleccionados = cliente.representantes.map((r) => r.id);
      next.observaciones = cliente.advertencia || '';
    }
    if (prefill.tipoMandante === 'natural' && prefill.naturalPersonId) {
      next.naturalPersonId = prefill.naturalPersonId;
    }
  }
  return next;
}

const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  const location = useLocation();
  const prefill = location.state || null;
  const [step, setStep] = useState(1);
  const [wizard, setWizard] = useState(() => initialWizardState(prefill));
  const [attempted, setAttempted] = useState(false);

  function update(patch) {
    setWizard((prev) => ({ ...prev, ...patch }));
  }

  function selectCliente(cliente) {
    setWizard((prev) => {
      const next = { ...prev, clienteId: cliente.id, repsGrupo: {}, advertenciaAceptada: false, advertenciaRechazada: false, observaciones: cliente.advertencia || '' };
      if (cliente.formaActuacion === 'unico') next.repsSeleccionados = [cliente.representantes[0].id];
      else if (cliente.formaActuacion === 'conjunta') next.repsSeleccionados = cliente.representantes.map((r) => r.id);
      else next.repsSeleccionados = [];
      return next;
    });
  }

  function firmantesActuales(cliente) {
    if (!cliente) return [];
    if (cliente.formaActuacion === 'grupos') {
      const ids = Object.values(wizard.repsGrupo).filter(Boolean);
      return cliente.gruposActuacion.every((g) => wizard.repsGrupo[g.nombre]) ? ids : [];
    }
    if ((cliente.formaActuacion === 'especial' || cliente.formaActuacion === 'incompleta') && !wizard.advertenciaAceptada) {
      return [];
    }
    return wizard.repsSeleccionados;
  }

  function currentDocumentModel() {
    if (!wizard.ciudadFirma || !wizard.fecha || !wizard.tipoMandante || !wizard.clienteId) return null;
    const cliente = getCliente(wizard.clienteId);
    if (!cliente) return null;
    if (wizard.tipoMandante === 'natural') {
      if (!wizard.naturalPersonId) return null;
      const persona = getRepresentante(cliente, wizard.naturalPersonId);
      if (!persona || !wizard.mandatariosSeleccionados.length) return null;
      return buildDocumentModel({
        ciudadFirma: wizard.ciudadFirma, fecha: wizard.fecha, tipoMandante: 'natural', cliente, personaNatural: persona,
        mandatarios: wizard.mandatariosSeleccionados.map(getMandatario),
      });
    }
    const firmantesIds = firmantesActuales(cliente);
    if (!firmantesIds.length || !wizard.mandatariosSeleccionados.length) return null;
    return buildDocumentModel({
      ciudadFirma: wizard.ciudadFirma, fecha: wizard.fecha, tipoMandante: 'juridica', cliente,
      firmantes: firmantesIds.map((id) => getRepresentante(cliente, id)),
      mandatarios: wizard.mandatariosSeleccionados.map(getMandatario),
    });
  }

  const value = useMemo(
    () => ({ wizard, update, selectCliente, firmantesActuales, currentDocumentModel, step, setStep, TOTAL_STEPS, attempted, setAttempted }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wizard, step, attempted]
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard debe usarse dentro de WizardProvider');
  return ctx;
}
