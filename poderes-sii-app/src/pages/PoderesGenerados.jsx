import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeleteModal from '../components/modals/DeleteModal';
import InternalLogModal from '../components/modals/InternalLogModal';
import PapeleraModal from '../components/modals/PapeleraModal';
import PdfViewerModal from '../components/modals/PdfViewerModal';
import DownloadPdfLink from '../components/DownloadPdfLink';
import Icon from '../components/Icon';
import { CURRENT_USER } from '../data/clientes';
import { usePoderesStore, trackLabel } from '../store/PoderesStoreContext';
import { useToast } from '../components/ToastContext';
import { fechaCortaFromISO, normalize } from '../utils/text';

function TrackBlock({ cliente, track, onVerPdf }) {
  const { vigenteFor, archivedFor, softDelete } = usePoderesStore();
  const navigate = useNavigate();
  const showToast = useToast();
  const [showVersions, setShowVersions] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const vigente = vigenteFor(cliente.id, track.key);
  const archivadas = archivedFor(cliente.id, track.key);
  const label = trackLabel(track.tipoMandante, track.naturalPersonNombre);

  function nuevaVersion() {
    navigate('/gestion-documental/poderes-sii/generar', {
      state: { clienteId: cliente.id, tipoMandante: track.tipoMandante, naturalPersonId: track.naturalPersonId, forceNewVersion: true },
    });
  }
  function confirmarEliminar(motivo) {
    softDelete(cliente.id, vigente.id, { usuario: CURRENT_USER, motivo });
    setDeleting(false);
    showToast('Poder SII eliminado. Queda registrado internamente y puede restaurarse desde la Papelera.');
  }

  return (
    <div style={{ paddingTop: 14, marginTop: 14, borderTop: '1px dashed var(--border)' }}>
      <div className="field-hint" style={{ textTransform: 'uppercase', letterSpacing: '.03em', marginBottom: 6, fontWeight: 700 }}>{label}</div>
      {vigente ? (
        <>
          <div className="poder-meta">
            <span className="pill pill-vigente">Vigente</span>
            <span>Versión {vigente.version}</span>
            <span>Fecha: {fechaCortaFromISO(vigente.fechaISO)}</span>
            <span>Creado por: {vigente.usuario}</span>
          </div>
          <div className="field-hint" style={{ marginTop: 8 }}>
            Mandatarios incluidos: {vigente.mandatarios.map((m) => m.nombre).join(', ')}
          </div>
          <div className="poder-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => onVerPdf(vigente, `${cliente.razonSocial} · ${label} · v${vigente.version}`)}>
              <Icon name="eye" /> Ver PDF
            </button>
            <DownloadPdfLink base64={vigente.pdfBase64} fileName={vigente.fileName} className="btn btn-secondary btn-sm">
              <Icon name="download" /> Descargar
            </DownloadPdfLink>
            <button className="btn btn-secondary btn-sm" onClick={nuevaVersion}><Icon name="plusCircle" /> Generar nueva versión</button>
            <button className="btn btn-danger btn-sm" onClick={() => setDeleting(true)}><Icon name="trash" /> Eliminar</button>
          </div>
        </>
      ) : (
        <button className="btn btn-primary btn-sm" onClick={nuevaVersion}><Icon name="plusCircle" /> Generar Poder SII</button>
      )}

      {archivadas.length > 0 && (
        <>
          <div className="versions-toggle" onClick={() => setShowVersions((v) => !v)}>
            <span>{showVersions ? '▾' : '▸'}</span> Ver versiones anteriores ({archivadas.length})
          </div>
          {showVersions && (
            <div className="versions-panel">
              {archivadas.map((v) => (
                <div className="version-row" key={v.id}>
                  <div>
                    Versión {v.version} · Fecha: {fechaCortaFromISO(v.fechaISO)} · Creado por: {v.usuario} · <span className="pill pill-archivado">Archivado</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onVerPdf(v, `${cliente.razonSocial} · ${label} · v${v.version} (archivada)`)}>
                      <Icon name="eye" /> Ver PDF
                    </button>
                    <DownloadPdfLink base64={v.pdfBase64} fileName={v.fileName} className="btn btn-secondary btn-sm">
                      <Icon name="download" /> Descargar
                    </DownloadPdfLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {deleting && (
        <DeleteModal
          clienteNombre={cliente.razonSocial}
          trackLabelText={label}
          onCancelar={() => setDeleting(false)}
          onConfirmar={confirmarEliminar}
        />
      )}
    </div>
  );
}

function ClienteFolder({ cliente, onVerPdf }) {
  const { tracksForCliente } = usePoderesStore();
  const tracks = tracksForCliente(cliente.id);
  return (
    <div className="client-folder">
      <div className="client-folder-head">
        <div>
          <h3>{cliente.razonSocial}</h3>
          <div className="poder-meta"><span>RUT: {cliente.rut}</span></div>
        </div>
      </div>
      {tracks.map((track) => <TrackBlock cliente={cliente} track={track} key={track.key} onVerPdf={onVerPdf} />)}
    </div>
  );
}

export default function PoderesGenerados() {
  const { clientesConPoder, internalLog, eliminados, restoreRecord, resetDemo } = usePoderesStore();
  const [search, setSearch] = useState('');
  const [showLog, setShowLog] = useState(false);
  const [showPapelera, setShowPapelera] = useState(false);
  const [viewer, setViewer] = useState(null);
  const showToast = useToast();

  const filtered = clientesConPoder.filter((c) => normalize(c.razonSocial).includes(normalize(search)));

  function handleVerPdf(record, title) {
    setViewer({ record, title });
  }
  function handleRestaurar(record) {
    restoreRecord(record.clienteId, record.id, { usuario: CURRENT_USER });
    showToast('Poder SII restaurado.');
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title">Poderes Generados</h1>
          <p className="page-subtitle">Poderes SII generados, ordenados por cliente.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowPapelera(true)}>
            <Icon name="trash" /> Papelera ({eliminados.length})
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowLog(true)}>
            <Icon name="shield" /> Registro interno ({internalLog.length})
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { resetDemo(); showToast('Datos de ejemplo restablecidos.'); }}
          >
            <Icon name="refresh" /> Restablecer datos de ejemplo
          </button>
        </div>
      </div>
      <div className="search-bar">
        <Icon name="search" />
        <input type="text" placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div>
        {filtered.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <Icon name="archive" />
              <p>No hay poderes generados que coincidan con la búsqueda.</p>
            </div>
          </div>
        )}
        {filtered.map((c) => <ClienteFolder cliente={c} key={c.id} onVerPdf={handleVerPdf} />)}
      </div>
      {showLog && <InternalLogModal log={internalLog} onClose={() => setShowLog(false)} />}
      {showPapelera && (
        <PapeleraModal eliminados={eliminados} onRestaurar={handleRestaurar} onClose={() => setShowPapelera(false)} />
      )}
      {viewer && (
        <PdfViewerModal
          title={viewer.title}
          base64={viewer.record.pdfBase64}
          fileName={viewer.record.fileName}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}
