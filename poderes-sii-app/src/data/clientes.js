// Datos simulados: en la plataforma real provienen del CRM / Centro de Comandos.
export const CLIENTES = [
  {
    id: 'linos',
    razonSocial: 'COMERCIALIZADORA DE LINOS SpA',
    rut: '77.758.327-1',
    giro: 'Comercialización de productos textiles y afines',
    domicilio: 'José Alcalde Delano #10545, Depto. #401',
    comuna: 'Lo Barnechea',
    ciudad: 'Santiago',
    region: 'Metropolitana de Santiago',
    representantes: [
      { id: 'linos-r1', nombre: 'Francisco José Ebel König', rut: '19.475.899-5', genero: 'M' },
    ],
    formaActuacion: 'unico',
    advertencia: null,
  },
  {
    id: 'andes',
    razonSocial: 'ANDES LOGISTICA SpA',
    rut: '76.000.000-0',
    giro: 'Servicios de logística y transporte de carga',
    domicilio: 'Av. Ejemplo 1234',
    comuna: 'Renca',
    ciudad: 'Santiago',
    region: 'Metropolitana de Santiago',
    representantes: [
      { id: 'andes-r1', nombre: 'Representante Uno', rut: '11.111.111-1', genero: 'M' },
      { id: 'andes-r2', nombre: 'Representante Dos', rut: '22.222.222-2', genero: 'F' },
    ],
    formaActuacion: 'indistinta',
    advertencia: null,
  },
  {
    id: 'conjunta',
    razonSocial: 'EMPRESA EJEMPLO CONJUNTA SpA',
    rut: '77.000.000-0',
    giro: 'Servicios de asesoría y consultoría empresarial',
    domicilio: 'Av. Legal 456',
    comuna: 'Providencia',
    ciudad: 'Santiago',
    region: 'Metropolitana de Santiago',
    representantes: [
      { id: 'conjunta-r1', nombre: 'Representante A', rut: '13.333.333-3', genero: 'M' },
      { id: 'conjunta-r2', nombre: 'Representante B', rut: '14.444.444-4', genero: 'F' },
    ],
    formaActuacion: 'conjunta',
    advertencia: null,
  },
  {
    id: 'transportes-sur',
    razonSocial: 'TRANSPORTES DEL SUR LTDA',
    rut: '78.222.111-9',
    giro: 'Transporte de carga por carretera',
    domicilio: 'Camino Longitudinal Sur Km 12',
    comuna: 'San Bernardo',
    ciudad: 'Santiago',
    region: 'Metropolitana de Santiago',
    representantes: [
      { id: 'ts-r1', nombre: 'Representante Uno de Tres', rut: '15.555.555-5', genero: 'M' },
      { id: 'ts-r2', nombre: 'Representante Dos de Tres', rut: '16.666.666-6', genero: 'F' },
      { id: 'ts-r3', nombre: 'Representante Tres de Tres', rut: '17.777.777-7', genero: 'M' },
    ],
    formaActuacion: 'dos_de_n',
    minRequeridos: 2,
    advertencia: null,
  },
  {
    id: 'grupo-norte',
    razonSocial: 'INVERSIONES GRUPO NORTE SpA',
    rut: '79.333.222-4',
    giro: 'Inversiones y gestión de activos',
    domicilio: 'Av. El Bosque Norte 500, Of. 1201',
    comuna: 'Las Condes',
    ciudad: 'Santiago',
    region: 'Metropolitana de Santiago',
    representantes: [
      { id: 'gn-a1', nombre: 'Representante Grupo A Uno', rut: '18.888.888-8', genero: 'M' },
      { id: 'gn-a2', nombre: 'Representante Grupo A Dos', rut: '19.999.999-K', genero: 'F' },
      { id: 'gn-b1', nombre: 'Representante Grupo B Uno', rut: '20.111.222-3', genero: 'M' },
    ],
    formaActuacion: 'grupos',
    gruposActuacion: [
      { nombre: 'Grupo A', repIds: ['gn-a1', 'gn-a2'] },
      { nombre: 'Grupo B', repIds: ['gn-b1'] },
    ],
    advertencia: null,
  },
  {
    id: 'pendiente',
    razonSocial: 'SOCIEDAD COMERCIAL PENDIENTE SpA',
    rut: '80.444.333-2',
    giro: 'Comercialización de insumos industriales',
    domicilio: 'Av. Independencia 890',
    comuna: 'Independencia',
    ciudad: 'Santiago',
    region: 'Metropolitana de Santiago',
    representantes: [
      { id: 'pend-r1', nombre: 'Representante Condicional Uno', rut: '21.222.333-4', genero: 'M' },
      { id: 'pend-r2', nombre: 'Representante Condicional Dos', rut: '22.333.444-5', genero: 'F' },
    ],
    formaActuacion: 'especial',
    advertencia:
      'Este cliente presenta facultades condicionadas y antecedentes de representación pendientes de validación notarial. Revisar la escritura vigente antes de emitir el Poder SII.',
  },
];

export const MANDATARIOS = [
  { id: 'm1', nombre: 'Nicolás Antonio Martínez Alvear', rut: '16.662.054-6', cargo: 'Abogado / Gestión tributaria', area: 'Legal', genero: 'M' },
  { id: 'm2', nombre: 'Víctor Contreras Antil', rut: '16.718.579-7', cargo: 'Gestión administrativa', area: 'Administración', genero: 'M' },
  { id: 'm3', nombre: 'Felipe Eduardo Espinosa Ibarra', rut: '20.451.866-1', cargo: 'Gestión documental', area: 'Gestión Documental', genero: 'M' },
  { id: 'm4', nombre: 'Brenda Scarlet Álvarez', rut: '20.379.630-7', cargo: 'Administración', area: 'Administración', genero: 'F' },
  { id: 'm5', nombre: 'Camila Alejandra Montoya', rut: '19.639.063-4', cargo: 'Legal laboral / administración de personas', area: 'Legal', genero: 'F' },
];

export const FORMA_ACTUACION_LABELS = {
  unico: 'Representante único',
  indistinta: 'Cualquiera de los representantes puede actuar indistintamente',
  conjunta: 'Actuación conjunta de todos los representantes',
  dos_de_n: 'Dos cualesquiera de los representantes',
  grupos: 'Actuación por grupos',
  especial: 'Facultades especiales o condicionadas',
  incompleta: 'Información incompleta o pendiente de validación',
};

export const CURRENT_USER = 'Usuario Demo (Sur Consulting)';

export function getCliente(id) {
  return CLIENTES.find((c) => c.id === id);
}
export function getMandatario(id) {
  return MANDATARIOS.find((m) => m.id === id);
}
export function getRepresentante(cliente, repId) {
  return cliente?.representantes.find((r) => r.id === repId);
}
