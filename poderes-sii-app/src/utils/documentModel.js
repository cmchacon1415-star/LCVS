import { buildPersonListText, donDona, fechaTextoFromISO } from './text';

// Matriz documental del Poder SII. Aislada en este módulo para que pueda
// reemplazarse o editarse sin tocar el resto de la lógica de la aplicación.
export function buildDocumentModel({ ciudadFirma, fecha, tipoMandante, cliente, personaNatural, firmantes, mandatarios }) {
  const year = fecha ? fecha.slice(0, 4) : new Date().getFullYear();
  const fechaTexto = fechaTextoFromISO(fecha);
  const titulo = `PODER SII ${year}`;
  const encabezado = `En ${ciudadFirma}, a ${fechaTexto}.`;

  let parrafo1;
  if (tipoMandante === 'natural') {
    const p = personaNatural;
    parrafo1 = `Comparece ${donDona(p.genero)} ${p.nombre}, cédula nacional de identidad N° ${p.rut}, con domicilio en ${cliente.domicilio}, comuna de ${cliente.comuna}, ${cliente.ciudad}, quien en adelante se denominará el "Mandante".`;
  } else {
    const compareientesText = buildPersonListText(firmantes);
    parrafo1 = `Comparece ${compareientesText}, en representación de la sociedad ${cliente.razonSocial}, Rol Único Tributario N° ${cliente.rut}, con domicilio en ${cliente.domicilio}, comuna de ${cliente.comuna}, ${cliente.ciudad}, quien en adelante se denominará el "Mandante".`;
  }

  const mandatariosText = buildPersonListText(mandatarios);
  const plural = mandatarios.length > 1;
  const verbo = plural ? 'actuando cualquiera de ellos en forma individual e indistinta, representen' : 'represente';
  const parrafo2 = `Por el presente instrumento, el Mandante confiere poder especial a ${mandatariosText}, para que, ${verbo} al Mandante ante el Servicio de Impuestos Internos y demás organismos públicos relacionados, con las facultades que se indican a continuación.`;

  const sujeto = plural ? 'los mandatarios' : 'el mandatario';
  const quedan = plural ? 'quedan' : 'queda';
  const facultado = plural ? 'facultados' : 'facultado';
  const parrafo3 = `En virtud del presente mandato, ${sujeto} ${quedan} ${facultado} para realizar, en nombre y representación del Mandante, todos los trámites necesarios ante el Servicio de Impuestos Internos, entre otros: inicio de actividades, término de giro, presentación y rectificación de declaraciones juradas, formularios y declaraciones de impuestos, solicitudes de modificación de datos, ampliaciones y modificaciones de giro, obtención y cambio de clave tributaria, suscripción de convenios de pago, solicitud de copias de giros y certificados de deudas fiscales, timbraje de documentos tributarios, y en general, todo trámite necesario o conveniente para el correcto cumplimiento de las obligaciones tributarias del Mandante.`;

  const cierre = `Se confieren al mandatario o mandatarios individualizados todas las facultades necesarias para el correcto desempeño del presente mandato, el que no está sujeto a plazo ni condición.`;

  const firmas = (tipoMandante === 'natural' ? [personaNatural] : firmantes).map((f) => ({
    nombre: f.nombre,
    ppLine: tipoMandante === 'natural' ? null : `pp. ${cliente.razonSocial}`,
    rutLine: tipoMandante === 'natural' ? f.rut : cliente.rut,
  }));

  return { titulo, encabezado, parrafo1, parrafo2, parrafo3, cierre, firmas };
}
