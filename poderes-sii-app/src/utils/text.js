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
