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
  ctx.font = `${bold ? 'bold ' : ''}${size}px Helvetica, Arial, sans-serif`;
  return ctx.measureText(text).width;
}
function wrapText(text, maxWidth, size, bold) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  words.forEach((w) => {
    const test = cur ? cur + ' ' + w : w;
    if (cur && textWidth(test, size, bold) > maxWidth) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  });
  if (cur) lines.push(cur);
  return lines;
}
function pdfEscape(s) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdfBinaryString(docModel) {
  const PAGE_W = 595.28, PAGE_H = 841.89;
  const MARGIN_X = 64, MARGIN_TOP = 76, MARGIN_BOTTOM = 70;
  const MAX_W = PAGE_W - MARGIN_X * 2;

  const blocks = [
    { text: docModel.titulo, size: 15, bold: true, align: 'center', spaceAfter: 22 },
    { text: docModel.encabezado, size: 11, bold: false, align: 'left', spaceAfter: 18 },
    ...[docModel.parrafo1, docModel.parrafo2, docModel.parrafo3, docModel.cierre].map((p) => ({
      text: p, size: 11, bold: false, align: 'left', spaceAfter: 16,
    })),
  ];

  const lines = [];
  blocks.forEach((b) => {
    const wrapped = wrapText(b.text, MAX_W, b.size, b.bold);
    wrapped.forEach((w, i) => {
      lines.push({ text: w, size: b.size, bold: b.bold, align: b.align, spaceAfter: i === wrapped.length - 1 ? b.spaceAfter : 4 });
    });
  });

  const sigLineHeight = 15;
  const sigBlockHeight = sigLineHeight * 3 + 34;

  const pages = [];
  let page = [];
  let y = PAGE_H - MARGIN_TOP;
  const lineHeight = (size) => size * 1.55;
  function newPage() { pages.push(page); page = []; y = PAGE_H - MARGIN_TOP; }

  lines.forEach((l) => {
    const lh = lineHeight(l.size);
    if (y - lh < MARGIN_BOTTOM) newPage();
    let x = MARGIN_X;
    if (l.align === 'center') x = (PAGE_W - textWidth(l.text, l.size, l.bold)) / 2;
    page.push({ text: l.text, x, y, size: l.size, bold: l.bold });
    y -= lh + l.spaceAfter;
  });

  y -= 30;
  docModel.firmas.forEach((f) => {
    if (y - sigBlockHeight < MARGIN_BOTTOM) { newPage(); y -= 10; }
    const startX = MARGIN_X;
    page.push({ text: '_'.repeat(38), x: startX, y, size: 11, bold: false });
    y -= lineHeight(11);
    page.push({ text: f.nombre, x: startX, y, size: 11, bold: false });
    y -= lineHeight(11);
    if (f.ppLine) {
      page.push({ text: f.ppLine, x: startX, y, size: 11, bold: false });
      y -= lineHeight(11);
    }
    page.push({ text: f.rutLine, x: startX, y, size: 11, bold: false });
    y -= lineHeight(11) + 26;
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
  push(fontRegularId, `${fontRegularId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`);
  push(fontBoldId, `${fontBoldId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`);

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
export function openPdfInNewTab(base64) {
  const blob = blobFromBase64Pdf(base64);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 20000);
}
