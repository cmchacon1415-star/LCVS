let cachedCtx = null;
function pdfCtx() {
  if (!cachedCtx) {
    const c = document.createElement('canvas');
    cachedCtx = c.getContext('2d');
  }
  return cachedCtx;
}
function textWidth(text, size, bold) {
  const ctx = pdfCtx();
  ctx.font = `${bold ? 'bold ' : ''}${size}px "Times New Roman", Times, serif`;
  return ctx.measureText(text).width;
}
function pdfEscape(s) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// cm -> pt (1 cm = 28.3464567 pt)
const CM = 28.3464567;
const PAGE_W = 595.28, PAGE_H = 841.89; // A4
const MARGIN_TOP = 2.5 * CM;
const MARGIN_BOTTOM = 2.5 * CM;
const MARGIN_LEFT = 3 * CM;
const MARGIN_RIGHT = 2.5 * CM;
const MAX_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;
const BODY_SIZE = 12;
const TITLE_SIZE = 14;
const LINE_HEIGHT_FACTOR = 1.15;
const PARAGRAPH_GAP = 10;

// Convierte los "runs" ({ text, bold }) de un párrafo en palabras separadas
// por espacio, donde cada palabra es a su vez una lista de fragmentos
// ({ text, bold }) por si el límite de un run cae en medio de una palabra
// (p. ej. un nombre en negrita seguido de una coma sin espacio: "SpA,").
// Los fragmentos de una misma palabra se dibujan pegados, sin espacio entre
// ellos; el espaciado (normal o justificado) solo se aplica entre palabras.
function runsToWordUnits(runs) {
  let fullText = '';
  const boldPerChar = [];
  runs.forEach((run) => {
    fullText += run.text;
    for (let i = 0; i < run.text.length; i++) boldPerChar.push(run.bold);
  });

  const words = [];
  let i = 0;
  while (i < fullText.length) {
    while (i < fullText.length && fullText[i] === ' ') i++;
    if (i >= fullText.length) break;
    const start = i;
    while (i < fullText.length && fullText[i] !== ' ') i++;
    const wordBold = boldPerChar.slice(start, i);
    const fragments = [];
    let fragStart = 0;
    for (let j = 1; j <= wordBold.length; j++) {
      if (j === wordBold.length || wordBold[j] !== wordBold[fragStart]) {
        fragments.push({ text: fullText.slice(start + fragStart, start + j), bold: wordBold[fragStart] });
        fragStart = j;
      }
    }
    words.push(fragments);
  }
  return words;
}

function wordUnitWidth(word, size) {
  return word.reduce((sum, frag) => sum + textWidth(frag.text, size, frag.bold), 0);
}

function layoutParagraph(words, size) {
  const spaceWidth = textWidth(' ', size, false);
  const lines = [];
  let current = [];
  let currentWidth = 0;

  words.forEach((word) => {
    const w = wordUnitWidth(word, size);
    const extra = current.length ? spaceWidth : 0;
    if (current.length && currentWidth + extra + w > MAX_W) {
      lines.push(current);
      current = [word];
      currentWidth = w;
    } else {
      current.push(word);
      currentWidth += extra + w;
    }
  });
  if (current.length) lines.push(current);

  return lines.map((lineWords, idx) => {
    const isLastLine = idx === lines.length - 1;
    const wordsWidth = lineWords.reduce((sum, w) => sum + wordUnitWidth(w, size), 0);
    const numGaps = lineWords.length - 1;
    let gap = spaceWidth;
    if (!isLastLine && numGaps > 0) {
      const naturalWidth = wordsWidth + numGaps * spaceWidth;
      gap = spaceWidth + (MAX_W - naturalWidth) / numGaps;
    }
    const items = [];
    let x = MARGIN_LEFT;
    lineWords.forEach((word, i) => {
      word.forEach((frag) => {
        items.push({ text: frag.text, bold: frag.bold, x });
        x += textWidth(frag.text, size, frag.bold);
      });
      if (i < lineWords.length - 1) x += gap;
    });
    return items;
  });
}

function buildPdfBinaryString(docModel) {
  const pages = [];
  let page = [];
  let y = PAGE_H - MARGIN_TOP;
  const lineHeight = BODY_SIZE * LINE_HEIGHT_FACTOR;
  function newPage() { pages.push(page); page = []; y = PAGE_H - MARGIN_TOP; }
  function ensureSpace(h) { if (y - h < MARGIN_BOTTOM) newPage(); }

  // Título: centrado, negrita, mayúsculas (ya viene en mayúsculas desde la matriz).
  ensureSpace(TITLE_SIZE * LINE_HEIGHT_FACTOR);
  const titleWidth = textWidth(docModel.titulo, TITLE_SIZE, true);
  page.push({ text: docModel.titulo, x: (PAGE_W - titleWidth) / 2, y, size: TITLE_SIZE, bold: true });
  y -= TITLE_SIZE * LINE_HEIGHT_FACTOR + PARAGRAPH_GAP * 1.5;

  docModel.paragraphs.forEach((runs) => {
    const words = runsToWordUnits(runs);
    const lines = layoutParagraph(words, BODY_SIZE);
    lines.forEach((lineItems) => {
      ensureSpace(lineHeight);
      lineItems.forEach((item) => {
        page.push({ text: item.text, x: item.x, y, size: BODY_SIZE, bold: item.bold });
      });
      y -= lineHeight;
    });
    y -= PARAGRAPH_GAP;
  });

  // Firma: se mantiene la misma estructura/lógica; solo se homologa la
  // tipografía y tamaño al resto del documento (12 pt).
  const sigLineHeight = BODY_SIZE * LINE_HEIGHT_FACTOR;
  const sigBlockHeight = sigLineHeight * 3 + 30;
  y -= 20;
  docModel.firmas.forEach((f) => {
    ensureSpace(sigBlockHeight);
    page.push({ text: '_'.repeat(38), x: MARGIN_LEFT, y, size: BODY_SIZE, bold: false });
    y -= sigLineHeight;
    page.push({ text: f.nombre, x: MARGIN_LEFT, y, size: BODY_SIZE, bold: false });
    y -= sigLineHeight;
    if (f.ppLine) {
      page.push({ text: f.ppLine, x: MARGIN_LEFT, y, size: BODY_SIZE, bold: false });
      y -= sigLineHeight;
    }
    page.push({ text: f.rutLine, x: MARGIN_LEFT, y, size: BODY_SIZE, bold: false });
    y -= sigLineHeight + 22;
  });
  if (page.length) pages.push(page);

  return assemblePdf(pages, PAGE_W, PAGE_H);
}

function assemblePdf(pages, w, h) {
  const catalogIdx = 1, pagesIdx = 2;
  let nextId = 3;
  const pageIds = [], contentIds = [];
  pages.forEach(() => { pageIds.push(nextId++); contentIds.push(nextId++); });
  const fontRegularId = nextId++;
  const fontBoldId = nextId++;

  const kids = pageIds.map((id) => `${id} 0 R`).join(' ');
  const header = `%PDF-1.4\n`;
  const catalogObj = `${catalogIdx} 0 obj\n<< /Type /Catalog /Pages ${pagesIdx} 0 R >>\nendobj\n`;
  const pagesObj = `${pagesIdx} 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageIds.length} >>\nendobj\n`;

  let out = header;
  const offsetsMap = {};
  function push(id, text) { offsetsMap[id] = out.length; out += text; }
  push(catalogIdx, catalogObj);
  push(pagesIdx, pagesObj);
  pages.forEach((page, idx) => {
    let stream = '';
    page.forEach((item) => {
      const font = item.bold ? '/F2' : '/F1';
      stream += `BT ${font} ${item.size} Tf 1 0 0 1 ${item.x.toFixed(2)} ${item.y.toFixed(2)} Tm (${pdfEscape(item.text)}) Tj ET\n`;
    });
    const pageObj = `${pageIds[idx]} 0 obj\n<< /Type /Page /Parent ${pagesIdx} 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentIds[idx]} 0 R >>\nendobj\n`;
    const contentObj = `${contentIds[idx]} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`;
    push(pageIds[idx], pageObj);
    push(contentIds[idx], contentObj);
  });
  push(fontRegularId, `${fontRegularId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>\nendobj\n`);
  push(fontBoldId, `${fontBoldId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`);

  const xrefStart = out.length;
  const maxId = fontBoldId;
  let xref = `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= maxId; i++) {
    const off = offsetsMap[i] !== undefined ? offsetsMap[i] : 0;
    xref += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  const trailer = `trailer\n<< /Size ${maxId + 1} /Root ${catalogIdx} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return out + xref + trailer;
}

export function pdfBase64FromModel(docModel) {
  return btoa(buildPdfBinaryString(docModel));
}
function binaryStringToUint8(binStr) {
  const arr = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) arr[i] = binStr.charCodeAt(i) & 0xff;
  return arr;
}
export function blobFromBase64Pdf(base64) {
  return new Blob([binaryStringToUint8(atob(base64))], { type: 'application/pdf' });
}
export function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
