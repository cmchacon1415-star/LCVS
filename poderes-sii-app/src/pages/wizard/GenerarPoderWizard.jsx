import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ToastContext';
import { getCliente } from '../../data/clientes';
import Stepper from './Stepper';
import StepDocumento from './StepDocumento';
import StepMandante from './StepMandante';
import StepCliente from './StepCliente';
import StepRepresentantes from './StepRepresentantes';
import StepMandatarios from './StepMandatarios';
import StepPreview from './StepPreview';
import { WizardProvider, useWizard } from './WizardContext';

function validateStep(step, wizard, firmantesActuales, showToast) {
  if (step === 1) return !!(wizard.ciudadFirma && wizard.fecha);
  if (step === 2) return !!wizard.tipoMandante;
  if (step === 3) return !!wizard.clienteId;
  if (step === 4) {
    const cliente = getCliente(wizard.clienteId);
    if (!cliente) return false;
    if (wizard.tipoMandante === 'natural') return !!wizard.naturalPersonId;
    if (wizard.advertenciaRechazada) {
      showToast('Debes resolver la advertencia (Entiendo y continuar) o seleccionar otro cliente.', true);
      return false;
    }
    const firmantes = firmantesActuales(cliente);
    if (!firmantes.length) {
      showToast('Debes seleccionar al menos un representante legal.', true);
      return false;
    }
    if (cliente.formaActuacion === 'dos_de_n' && firmantes.length !== (cliente.minRequeridos || 2)) {
      showToast(`Debes seleccionar exactamente ${cliente.minRequeridos || 2} representantes.`, true);
      return false;
    }
    if (cliente.formaActuacion === 'conjunta' && firmantes.length !== cliente.representantes.length) {
      showToast('La actuación conjunta requiere a todos los representantes.', true);
      return false;
    }
    return true;
  }
  if (step === 5) return !!wizard.mandatariosSeleccionados.length;
  return true;
}

function WizardBody() {
  const { wizard, step, setStep, firmantesActuales, attempted, setAttempted, TOTAL_STEPS } = useWizard();
  const showToast = useToast();
  const navigate = useNavigate();

  function handleNext() {
    const ok = validateStep(step, wizard, firmantesActuales, showToast);
    if (!ok) { setAttempted(true); return; }
    setAttempted(false);
    if (step < TOTAL_STEPS) setStep(step + 1);
  }
  function handlePrev() {
    setAttempted(false);
    setStep(step - 1);
  }

  const steps = [StepDocumento, StepMandante, StepCliente, StepRepresentantes, StepMandatarios, StepPreview];
  const StepComponent = steps[step - 1];

  return (
    <>
      <h1 className="page-title">Generar Poder SII</h1>
      <p className="page-subtitle">
        {wizard.forceNewVersion ? 'Generando nueva versión para un cliente existente.' : 'Completa los pasos para generar el documento.'}
      </p>
      <Stepper step={step} />
      <div className="card">
        <StepComponent />
      </div>
      {step < TOTAL_STEPS && (
        <div className="footer-nav">
          <button className="btn btn-ghost" onClick={() => navigate('/gestion-documental/poderes-sii')}>Cancelar</button>
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 1 && <button className="btn btn-secondary" onClick={handlePrev}>Anterior</button>}
            <button className="btn btn-primary" onClick={handleNext}>Continuar</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function GenerarPoderWizard() {
  return (
    <WizardProvider>
      <WizardBody />
    </WizardProvider>
  );
}
