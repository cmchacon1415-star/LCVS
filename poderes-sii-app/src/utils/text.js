export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function normalize(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function donDona(genero) {
  return genero === 'F' ? 'Doña' : 'Don';
}

// Nombres de pila comunes en Chile con flexión femenina, para inferir
// Don/Doña automáticamente sin depender de un campo "sexo" almacenado.
const FEMALE_FIRST_NAMES = new Set([
  'maria', 'ana', 'antonia', 'francisca', 'carolina', 'javiera', 'camila', 'fernanda',
  'valentina', 'constanza', 'catalina', 'paula', 'carmen', 'rosa', 'isabel', 'patricia',
  'claudia', 'marcela', 'pamela', 'daniela', 'andrea', 'macarena', 'ximena', 'soledad',
  'gabriela', 'alejandra', 'veronica', 'monica', 'sandra', 'ines', 'pilar', 'elena',
  'sofia', 'victoria', 'emilia', 'trinidad', 'martina', 'antonella', 'josefa', 'renata',
  'brenda', 'scarlet', 'ignacia', 'florencia', 'belen', 'margarita', 'teresa', 'laura',
  'natalia', 'carla', 'loreto', 'angelica', 'beatriz', 'cecilia', 'irene', 'julia',
  'lorena', 'miriam', 'olga', 'raquel', 'silvia', 'susana', 'yasna',
]);
// Excepciones: nombres masculinos que terminan en "a".
const MALE_NAMES_ENDING_IN_A = new Set(['luca']);

// Infiere Don/Doña a partir del nombre de pila, sin requerir un campo de
// género almacenado en los datos (representante legal o mandatario).
export function inferGenderFromName(nombreCompleto) {
  const first = normalize(nombreCompleto).trim().split(/\s+/)[0] || '';
  if (FEMALE_FIRST_NAMES.has(first)) return 'F';
  if (MALE_NAMES_ENDING_IN_A.has(first)) return 'M';
  if (first.endsWith('a')) return 'F';
  return 'M';
}

export function donDonaByName(nombreCompleto) {
  return donDona(inferGenderFromName(nombreCompleto));
}

export function mandatarioSingularTitulo(nombre) {
  return inferGenderFromName(nombre) === 'F' ? 'la "Mandataria"' : 'el "Mandatario"';
}
export function mandatarioSingularSujeto(nombre) {
  return inferGenderFromName(nombre) === 'F' ? 'la Mandataria' : 'el Mandatario';
}
export function mandatarioSingularDativo(nombre) {
  return inferGenderFromName(nombre) === 'F' ? 'a la Mandataria' : 'al Mandatario';
}

export function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}

export function fechaTextoFromISO(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

export function fechaCortaFromISO(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${pad2(d)}-${pad2(m)}-${y}`;
}

// "Don A, cédula ... N° X, Doña B, cédula ... N° Y, y Don C, cédula ... N° Z"
export function buildPersonListText(people) {
  const items = people.map(
    (p) => `${donDona(p.genero)} ${p.nombre}, cédula nacional de identidad N° ${p.rut}`
  );
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]}, y ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, y ${items[items.length - 1]}`;
}
