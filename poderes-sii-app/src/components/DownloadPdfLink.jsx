import { useEffect, useMemo } from 'react';
import { blobFromBase64Pdf } from '../utils/pdf';

// Enlace real (no un clic sintético vía JS) para descargar el PDF. Algunos
// navegadores y contextos embebidos con políticas de seguridad estrictas
// solo permiten una descarga cuando proviene de un clic genuino del usuario
// sobre un <a download>, y bloquean silenciosamente las descargas disparadas
// por script (`elemento.click()`), aunque el resultado visual sea el mismo.
export default function DownloadPdfLink({ base64, fileName, className, children }) {
  const url = useMemo(() => URL.createObjectURL(blobFromBase64Pdf(base64)), [base64]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <a className={className} href={url} download={fileName}>
      {children}
    </a>
  );
}
