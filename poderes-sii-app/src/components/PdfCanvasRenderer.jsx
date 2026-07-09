import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// Se incrusta el texto del worker directamente en el bundle (en vez de
// referenciarlo por URL) para que la vista previa funcione incluso dentro
// de un iframe con sandbox estricto o sin acceso a red: no depende de una
// petición adicional, todo el motor de PDF.js vive en el mismo archivo.
import pdfWorkerSource from 'pdfjs-dist/build/pdf.worker.min.mjs?raw';

let workerBlobUrl = null;
function getWorkerBlobUrl() {
  if (!workerBlobUrl) {
    const blob = new Blob([pdfWorkerSource], { type: 'text/javascript' });
    workerBlobUrl = URL.createObjectURL(blob);
  }
  return workerBlobUrl;
}
pdfjsLib.GlobalWorkerOptions.workerSrc = getWorkerBlobUrl();

function base64ToUint8(base64) {
  const binStr = atob(base64);
  const arr = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) arr[i] = binStr.charCodeAt(i);
  return arr;
}

// Renderiza el PDF a <canvas> usando PDF.js (motor puro en JavaScript), sin
// pasar por el visor de PDF nativo del navegador. El visor nativo se
// deshabilita por completo dentro de cualquier <iframe sandbox>, que es
// justamente cómo se sirve la vista previa embebida de este prototipo, y
// mostraba una página en blanco con el ícono de error en ese contexto.
export default function PdfCanvasRenderer({ base64 }) {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    const container = containerRef.current;
    if (container) container.innerHTML = '';

    const loadingTask = pdfjsLib.getDocument({ data: base64ToUint8(base64) });
    loadingTask.promise
      .then(async (pdf) => {
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'pdf-canvas-page';
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;
          if (container) container.appendChild(canvas);
        }
        if (!cancelled) setStatus('ready');
      })
      .catch((err) => {
        if (!cancelled) {
          setErrorMessage(err?.message || 'Error desconocido');
          setStatus('error');
        }
      });

    return () => { cancelled = true; };
  }, [base64]);

  return (
    <div className="pdf-canvas-outer">
      {status === 'loading' && (
        <div className="empty-state"><p>Cargando documento...</p></div>
      )}
      {status === 'error' && (
        <div className="empty-state"><p>No se pudo renderizar la vista previa del PDF ({errorMessage}). Puedes descargarlo con el botón de arriba.</p></div>
      )}
      <div ref={containerRef} className="pdf-canvas-container" />
    </div>
  );
}
