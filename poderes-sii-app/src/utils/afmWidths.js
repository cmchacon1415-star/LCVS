// Métricas de ancho (AFM) estándar de los fuentes base-14 del PDF
// "Times-Roman" y "Times-Bold", en milésimas de em, tal como las define la
// especificación de Adobe. Cualquier visor de PDF conforme al estándar
// (incluido PDF.js) usa estas mismas métricas para calcular el avance de
// cada carácter cuando la fuente no lleva un programa de fuente embebido,
// que es nuestro caso. Medir el texto con el font-rendering del navegador
// (canvas measureText con "Times New Roman") no es equivalente: el
// sustituto interno de PDF.js para las 14 fuentes estándar tiene métricas
// propias, distintas de las del "Times New Roman" del sistema, lo que
// desalineaba el título centrado y la justificación del cuerpo. Usando
// esta tabla, lo que calculamos al construir el PDF coincide exactamente
// con lo que el visor va a dibujar.
const TIMES_ROMAN = {
  ' ': 250, '!': 333, '"': 408, '#': 500, '$': 500, '%': 833, '&': 778, "'": 180,
  '(': 333, ')': 333, '*': 500, '+': 564, ',': 250, '-': 333, '.': 250, '/': 278,
  '0': 500, '1': 500, '2': 500, '3': 500, '4': 500, '5': 500, '6': 500, '7': 500, '8': 500, '9': 500,
  ':': 278, ';': 278, '<': 564, '=': 564, '>': 564, '?': 444, '@': 921,
  A: 722, B: 667, C: 667, D: 722, E: 611, F: 556, G: 722, H: 722, I: 333, J: 389,
  K: 722, L: 611, M: 889, N: 722, O: 722, P: 556, Q: 722, R: 667, S: 556, T: 611,
  U: 722, V: 722, W: 944, X: 722, Y: 722, Z: 611,
  '[': 333, '\\': 278, ']': 333, '^': 469, _: 500, '`': 333,
  a: 444, b: 500, c: 444, d: 500, e: 444, f: 333, g: 500, h: 500, i: 278, j: 278,
  k: 500, l: 278, m: 778, n: 500, o: 500, p: 500, q: 500, r: 333, s: 389, t: 278,
  u: 500, v: 500, w: 722, x: 500, y: 500, z: 444,
  '{': 480, '|': 200, '}': 480, '~': 541,
  '°': 400, '¿': 444, '¡': 333,
};

const TIMES_BOLD = {
  ' ': 250, '!': 333, '"': 555, '#': 500, '$': 500, '%': 1000, '&': 833, "'": 278,
  '(': 333, ')': 333, '*': 500, '+': 570, ',': 250, '-': 333, '.': 250, '/': 278,
  '0': 500, '1': 500, '2': 500, '3': 500, '4': 500, '5': 500, '6': 500, '7': 500, '8': 500, '9': 500,
  ':': 333, ';': 333, '<': 570, '=': 570, '>': 570, '?': 500, '@': 930,
  A: 722, B: 667, C: 667, D: 722, E: 667, F: 611, G: 778, H: 778, I: 389, J: 500,
  K: 778, L: 667, M: 944, N: 722, O: 778, P: 611, Q: 778, R: 722, S: 556, T: 667,
  U: 722, V: 722, W: 1000, X: 722, Y: 722, Z: 667,
  '[': 333, '\\': 278, ']': 333, '^': 581, _: 500, '`': 333,
  a: 500, b: 556, c: 444, d: 556, e: 444, f: 333, g: 500, h: 556, i: 278, j: 333,
  k: 556, l: 278, m: 833, n: 556, o: 500, p: 556, q: 556, r: 444, s: 389, t: 333,
  u: 556, v: 500, w: 722, x: 500, y: 500, z: 444,
  '{': 394, '|': 220, '}': 394, '~': 520,
  '°': 500, '¿': 500, '¡': 333,
};

// Letras acentuadas / con diéresis / eñe: los AFM base no traen entradas
// propias para el rango WinAnsi extendido; su avance se aproxima muy bien
// con el de la letra base (el acento no ensancha el glifo de forma
// perceptible en Times), que es la práctica habitual de las librerías PDF
// que no embeben la fuente.
const ACCENT_BASE = {
  á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n', ü: 'u',
  Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', Ñ: 'N', Ü: 'U',
};

function baseCharWidth(table, ch) {
  if (table[ch] !== undefined) return table[ch];
  const base = ACCENT_BASE[ch];
  if (base && table[base] !== undefined) return table[base];
  return 500; // fallback razonable para cualquier carácter no contemplado
}

export function charWidthUnits(ch, bold) {
  return baseCharWidth(bold ? TIMES_BOLD : TIMES_ROMAN, ch);
}

export function textWidthPt(text, size, bold) {
  let units = 0;
  for (const ch of text) units += charWidthUnits(ch, bold);
  return (units / 1000) * size;
}
