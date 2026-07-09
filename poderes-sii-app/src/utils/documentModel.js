import {
  donDonaByName,
  fechaTextoFromISO,
  mandatarioSingularDativo,
  mandatarioSingularSujeto,
  mandatarioSingularTitulo,
} from './text';

// ============================================================================
// MATRIZ DOCUMENTAL DEL PODER SII
// ----------------------------------------------------------------------------
// Este módulo concentra únicamente el TEXTO y la ESTRUCTURA del documento.
// No decide qué datos existen ni cómo se obtienen: recibe siempre datos ya
// resueltos (cliente, representantes, mandatarios, ciudad, fecha) desde el
// resto de la aplicación, tal como antes. Reemplazar o editar la redacción
// solo requiere tocar este archivo.
//
// Cada párrafo se modela como un arreglo de "runs" ({ text, bold }) en lugar
// de un string plano, para poder resaltar en negrita únicamente la primera
// aparición de cada dato dinámico (Razón Social, Giro, RUT Empresa,
// Representante Legal, RUT Representante, Domicilio, Mandatarios, RUT de
// Mandatarios), tanto en la vista previa en pantalla como en el PDF.
// ============================================================================

export function seg(text, bold = false) {
  return { text, bold };
}

function domicilioCompleto(cliente) {
  return `${cliente.domicilio}, comuna de ${cliente.comuna}, ${cliente.ciudad}`;
}

// "Don A, cédula nacional de identidad N.° X, Doña B, cédula ... N.° Y, y Don C, cédula ... N.° Z"
// como runs, con negrita opcional en nombres/RUT (para la primera aparición del dato).
function personListRuns(people, { boldName = false, boldRut = false } = {}) {
  const runs = [];
  people.forEach((p, i) => {
    if (i > 0) runs.push(seg(i === people.length - 1 ? ', y ' : ', '));
    runs.push(seg(`${donDonaByName(p.nombre)} `));
    runs.push(seg(p.nombre, boldName));
    runs.push(seg(', cédula nacional de identidad N.° '));
    runs.push(seg(p.rut, boldRut));
  });
  return runs;
}

export function buildDocumentModel({ ciudadFirma, fecha, tipoMandante, cliente, personaNatural, firmantes, mandatarios }) {
  const fechaTexto = fechaTextoFromISO(fecha);
  const titulo = 'PODER ESPECIAL PARA TRÁMITES ANTE EL SERVICIO DE IMPUESTOS INTERNOS';

  // -------- Párrafo 1: comparecencia --------
  let parrafo1;
  if (tipoMandante === 'natural') {
    parrafo1 = [
      seg(`En ${ciudadFirma}, a ${fechaTexto}, comparece `),
      ...personListRuns([personaNatural], { boldName: true, boldRut: true }),
      seg(', con domicilio en '),
      seg(domicilioCompleto(cliente), true),
      seg(', en adelante la "Mandante" o "Parte Mandante", quien expone:'),
    ];
  } else {
    const variosRepresentantes = firmantes.length > 1;
    parrafo1 = [
      seg(`En ${ciudadFirma}, a ${fechaTexto}, comparece `),
      seg(cliente.razonSocial, true),
      seg(', sociedad del giro '),
      seg(cliente.giro, true),
      seg(', Rol Único Tributario N.° '),
      seg(cliente.rut, true),
      seg(', debidamente representada por '),
      ...personListRuns(firmantes, { boldName: true, boldRut: true }),
      seg(`, ${variosRepresentantes ? 'todos' : 'ambos'} con domicilio en `),
      seg(domicilioCompleto(cliente), true),
      seg(', en adelante la "Mandante" o "Parte Mandante", quien expone:'),
    ];
  }

  // -------- Párrafo 2: constitución del mandato --------
  const plural = mandatarios.length > 1;
  const parrafo2 = [
    seg('Por el presente instrumento, la Parte Mandante confiere mandato especial, tan amplio y suficiente como en derecho corresponda, '),
    seg(plural ? 'a las siguientes personas: ' : 'a la siguiente persona: '),
    ...personListRuns(mandatarios, { boldName: true, boldRut: true }),
    seg(', en adelante '),
    seg(plural ? 'los "Mandatarios"' : mandatarioSingularTitulo(mandatarios[0].nombre)),
    seg(', '),
    seg(
      plural
        ? 'quienes podrán actuar de manera individual e indistinta, cualquiera de ellos, en representación de la Parte Mandante ante el Servicio de Impuestos Internos y demás organismos públicos relacionados.'
        : 'quien podrá actuar en representación de la Parte Mandante ante el Servicio de Impuestos Internos y demás organismos públicos relacionados.'
    ),
  ];

  // -------- Párrafo 3: facultades para trámites ante el SII --------
  // Enumeración enunciativa y no taxativa: se listan expresamente todas las
  // facultades de la matriz original, en párrafo continuo (sin viñetas),
  // dejando abierta la cláusula a cualquier otro trámite ante el SII.
  const sujetoPlural = plural ? 'los Mandatarios' : mandatarioSingularSujeto(mandatarios[0].nombre);
  const sujetoDativoParrafo3 = plural ? 'a los Mandatarios' : mandatarioSingularDativo(mandatarios[0].nombre);
  const parrafo3 = [
    seg(`En el ejercicio del presente mandato, ${sujetoPlural} ${plural ? 'podrán' : 'podrá'} realizar, en nombre y representación de la Parte Mandante, todos los trámites que sean necesarios ante el Servicio de Impuestos Internos, incluyendo, entre otros: la iniciación de actividades; el término de giro; la firma de declaraciones juradas de ingresos y gastos conforme al artículo 60 del Código Tributario; la firma y presentación de declaraciones de no declarantes, rectificatorias y modificatorias de los Formularios 22, 29 y 50; la solicitud de giros; la notificación de cobranzas tributarias; la corrección de datos de identificación; la solicitud y obtención de claves de acceso; la firma de convenios de pago; la solicitud de copias de giros, certificados de deudas y demás antecedentes ante la Tesorería General de la República; el timbraje de boletas, facturas, guías de despacho y libros de contabilidad; y cualquier otro documento o trámite ante el Servicio de Impuestos Internos. Las facultades precedentemente enunciadas tienen un carácter meramente ejemplar y no taxativo, sin que su detalle implique limitación alguna al presente mandato, para cuyo eficaz cumplimiento se ${plural ? 'les' : 'le'} confieren ${sujetoDativoParrafo3} las más amplias facultades, a fin de que ${plural ? 'procedan' : 'proceda'} conforme a derecho.`),
  ];

  // -------- Párrafo 4: facultades especiales (Formulario 3230, claves SII, etc.) --------
  const sujetoDativoPlural = plural ? 'a los Mandatarios' : mandatarioSingularDativo(mandatarios[0].nombre);
  const parrafo4 = [
    seg(`Para el eficaz y correcto desempeño del presente mandato, se faculta expresamente ${sujetoDativoPlural} para suscribir y presentar el Formulario 3230 y cualquier otro formulario o solicitud ante el Servicio de Impuestos Internos; obtener y operar claves SII; retirar, suscribir y presentar toda clase de documentos, solicitudes y formularios; así como ejecutar cualquier otro acto o gestión necesaria o conveniente para el correcto cumplimiento del presente mandato.`),
  ];

  // -------- Cláusula final --------
  const cierre = [
    seg('El presente mandato se otorga por tiempo indefinido y no se encuentra sujeto a plazo ni condición. DOY FE.-'),
  ];

  const paragraphs = [parrafo1, parrafo2, parrafo3, parrafo4, cierre];

  // -------- Firma (sin cambios respecto de la lógica anterior) --------
  const firmas = (tipoMandante === 'natural' ? [personaNatural] : firmantes).map((f) => ({
    nombre: f.nombre,
    ppLine: tipoMandante === 'natural' ? null : `pp. ${cliente.razonSocial}`,
    rutLine: tipoMandante === 'natural' ? f.rut : cliente.rut,
  }));

  return { titulo, paragraphs, firmas };
}
