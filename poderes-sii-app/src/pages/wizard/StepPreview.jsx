import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import PdfViewerModal from '../../components/modals/PdfViewerModal';
import { CURRENT_USER, getCliente, getMandatario, getRepresentante } from '../../data/clientes';
import { usePoderesStore, trackKey, trackLabel } from '../../store/PoderesStoreContext';
import { useToast } from '../../components/ToastContext';
import { pdfBase64FromModel, triggerDownload, blobFromBase64Pdf } from '../../utils/pdf';
import { useWizard } from './WizardContext';
import DuplicateModal from './modals/DuplicateModal';

export default function StepPreview() {
  const { wizard, currentDocumentModel, setStep } = useWizard();
  const { vigenteFor, addVersion } = usePoderesStore();
  const showToast = useToast();
  const navigate = useNavigate();
  const [duplicate, setDuplicate] = useState(null);
  const [viewingPrevious, setViewingPrevious] = useState(null);

  const model = currentDocumentModel();
  const cancelLabel = wizard.forceNewVersion ? 'Cancelar y volver a Poderes Generados' : 'Cancelar';
  const cancelTarget = wizard.forceNewVersion ? '/gestion-documental/poderes-sii/generados' : '/gestion-documental/poderes-sii';

  if (!model) {
    return (
      <>
        <div className="banner banner-warning">
          <Icon name="alert" />
          <div>Faltan datos obligatorios. Vuelve a los pasos anteriores para completarlos.</div>
        </div>
        <div className="footer-nav">
          <button className="btn btn-ghost" onClick={() => navigate(cancelTarget)}>{cancelLabel}</button>
          <button className="btn btn-secondary" onClick={() => setStep(1)}>Volver al inicio del formulario</button>
        </div>
      </>
    );
  }

  const cliente = getCliente(wizard.clienteId);
  const naturalPerson = wizard.tipoMandante === 'natural' ? getRepresentante(cliente, wizard.naturalPersonId) : null;
  const track = trackKey(wizard.tipoMandante, wizard.naturalPersonId);

  function finalize() {
    const base64 = pdfBase64FromModel(model);
    const created = addVersion(cliente.id, {
      tipoMandante: wizard.tipoMandante,
      naturalPersonId: wizard.tipoMandante === 'natural' ? wizard.naturalPersonId : null,
      naturalPersonNombre: wizard.tipoMandante === 'natural' ? naturalPerson.nombre : null,
      fechaISO: wizard.fecha,
      usuario: CURRENT_USER,
      mandatarios: wizard.mandatariosSeleccionados.map(getMandatario).map((m) => ({ nombre: m.nombre, rut: m.rut })),
      observaciones: wizard.observaciones || '',
      pdfBase64: base64,
    });
    triggerDownload(blobFromBase64Pdf(base64), created.fileName);
    showToast(`Poder SII generado y descargado (${created.fileName}). Si la descarga no se inició sola, puedes abrirlo desde "Poderes Generados" con Ver PDF o Descargar.`);
    navigate('/gestion-documental/poderes-sii/generados');
  }

  function handleGenerar() {
    const vigente = wizard.forceNewVersion ? null : vigenteFor(cliente.id, track);
    if (vigente) setDuplicate(vigente);
    else finalize();
  }

  return (
    <>
      <h3 style={{ marginTop: 0 }}>Revisión del Poder SII</h3>
      <p className="field-hint" style={{ marginBottom: 16 }}>Revisa el documento completo antes de generar el PDF final.</p>
      <div className="doc-sheet">
        <h2>{model.titulo}</h2>
        {model.paragraphs.map((runs, i) => (
          <p key={i}>
            {runs.map((run, j) => (run.bold ? <b key={j}>{run.text}</b> : <span key={j}>{run.text}</span>))}
          </p>
        ))}
        <div className="doc-signatures">
          {model.firmas.map((f, i) => (
            <div className="doc-signature" key={i}>
              <div className="sigline" />
              <div>{f.nombre}</div>
              {f.ppLine && <div>{f.ppLine}</div>}
              <div>{f.rutLine}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="footer-nav">
        <button className="btn btn-ghost" onClick={() => navigate(cancelTarget)}>{cancelLabel}</button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setStep(5)}>Anterior</button>
          <button className="btn btn-primary" onClick={handleGenerar}>
            <Icon name="fileText" /> Generar PDF
          </button>
        </div>
      </div>

      {duplicate && (
        <DuplicateModal
          clienteNombre={cliente.razonSocial}
          trackLabelText={trackLabel(wizard.tipoMandante, naturalPerson?.nombre)}
          vigente={duplicate}
          onCancelar={() => setDuplicate(null)}
          onVerAnterior={() => { setViewingPrevious(duplicate); setDuplicate(null); }}
          onNuevaVersion={() => { setDuplicate(null); finalize(); }}
        />
      )}

      {viewingPrevious && (
        <PdfViewerModal
          title={`Poder SII vigente · versión ${viewingPrevious.version}`}
          base64={viewingPrevious.pdfBase64}
          fileName={viewingPrevious.fileName}
          onClose={() => setViewingPrevious(null)}
        />
      )}
    </>
  );
}
