import { pdfDataUri } from '../utils/pdf';

// Enlace real (no un clic sintético vía JS) para descargar el PDF, con un
// data: URI en vez de un blob: URL. Un blob: URL solo es válido dentro del
// mismo contexto de navegación que lo creó (y se invalida si el efecto que
// lo generó se limpia antes de que el navegador termine de guardar el
// archivo); un data: URI lleva el archivo completo codificado en la propia
// URL, así que no depende de ningún registro ni ciclo de vida de React.
export default function DownloadPdfLink({ base64, fileName, className, children }) {
  return (
    <a className={className} href={pdfDataUri(base64)} download={fileName}>
      {children}
    </a>
  );
}
