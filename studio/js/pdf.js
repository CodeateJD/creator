// ═══════════════════════════════════════════════════════════════
// codeateJD Studio — pdf.js
// Modulo PDF aislado: PDF→IMG, Separar, Unir, Editar
// Usa pdf.js (UMD global), pdf-lib (global), JSZip (global)
// ═══════════════════════════════════════════════════════════════

(function() {
'use strict';

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// ───────────────────────── Modal controller ─────────────────────────
const modal = document.getElementById('pdfModal');
const modalBackdrop = document.getElementById('pdfModalBackdrop');
const modalClose = document.getElementById('pdfModalClose');

const PDF_PRO_TABS = ['pdf', 'split', 'merge'];
function openPdfModal(tab) {
  const t = tab || 'pdf';
  if (PDF_PRO_TABS.includes(t) && typeof isPro === 'function' && !isPro()) {
    if (typeof showUpgradeModal === 'function') showUpgradeModal('pdf-' + t);
    else alert('Esta herramienta PDF es Pro. Upgrade para usarla.');
    return;
  }
  modal.classList.add('open');
  switchTab(t);
}
function closePdfModal() {
  modal.classList.remove('open');
}
modalBackdrop.addEventListener('click', closePdfModal);
modalClose.addEventListener('click', closePdfModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closePdfModal();
});

function switchTab(tab) {
  if (PDF_PRO_TABS.includes(tab) && typeof isPro === 'function' && !isPro()) {
    if (typeof showUpgradeModal === 'function') showUpgradeModal('pdf-' + tab);
    else alert('Esta tab es Pro');
    return;
  }
  document.querySelectorAll('.pdf-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.pdf-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + tab));
}
document.querySelectorAll('.pdf-tab').forEach(t => {
  t.addEventListener('click', () => switchTab(t.dataset.tab));
});

// ───────────────────────── Sidebar button + submenu ─────────────────────────
const pdfToolBtn = document.getElementById('toolPdf');
const pdfSubmenu = document.getElementById('pdfSubmenu');

function positionSubmenu() {
  const rect = pdfToolBtn.getBoundingClientRect();
  pdfSubmenu.style.left = (rect.right + 6) + 'px';
  pdfSubmenu.style.top = rect.top + 'px';
}

pdfToolBtn.addEventListener('click', e => {
  e.stopPropagation();
  const willOpen = !pdfSubmenu.classList.contains('open');
  if (willOpen) positionSubmenu();
  pdfSubmenu.classList.toggle('open');
});
window.addEventListener('resize', () => {
  if (pdfSubmenu.classList.contains('open')) positionSubmenu();
});
window.addEventListener('scroll', () => {
  if (pdfSubmenu.classList.contains('open')) positionSubmenu();
}, true);
document.addEventListener('click', e => {
  if (!pdfSubmenu.contains(e.target) && e.target !== pdfToolBtn) {
    pdfSubmenu.classList.remove('open');
  }
});
pdfSubmenu.querySelectorAll('[data-tab]').forEach(item => {
  item.addEventListener('click', () => {
    pdfSubmenu.classList.remove('open');
    openPdfModal(item.dataset.tab);
  });
});

// ───────────────────────── Helpers ─────────────────────────
function setupUpload(zoneId, inputId, onFiles) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', () => { if (input.files.length) onFiles(input.files); });
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  });
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function createResultCard(container, imgSrc, name, blob) {
  const card = document.createElement('div');
  card.className = 'pdf-result-card';
  const img = document.createElement('img');
  img.src = imgSrc;
  card.appendChild(img);
  const info = document.createElement('div');
  info.className = 'info';
  const nameSpan = document.createElement('span');
  nameSpan.className = 'name';
  nameSpan.textContent = name;
  info.appendChild(nameSpan);
  const sizeSpan = document.createElement('span');
  sizeSpan.className = 'size';
  sizeSpan.textContent = (blob.size / 1024).toFixed(0) + ' KB';
  info.appendChild(sizeSpan);
  const dlBtn = document.createElement('button');
  dlBtn.className = 'dl-btn';
  dlBtn.innerHTML = '&#11015;';
  dlBtn.title = 'Descargar';
  dlBtn.addEventListener('click', () => downloadBlob(blob, name));
  info.appendChild(dlBtn);
  card.appendChild(info);
  container.appendChild(card);
  return { name, blob };
}

async function downloadZip(items, zipName) {
  const zip = new JSZip();
  items.forEach(item => zip.file(item.name, item.blob));
  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, zipName);
}

// ═══════════════════════ PDF TO IMAGE ═══════════════════════
let pdfFile = null;
let pdfResultItems = [];

setupUpload('pdf-upload', 'pdf-input', files => {
  pdfFile = files[0];
  if (!pdfFile || !pdfFile.name.toLowerCase().endsWith('.pdf')) {
    alert('Por favor selecciona un archivo PDF');
    return;
  }
  document.getElementById('pdf-upload').style.display = 'none';
  document.getElementById('pdf-options').classList.add('visible');
});

document.getElementById('pdf-reset').addEventListener('click', () => {
  pdfFile = null;
  pdfResultItems = [];
  document.getElementById('pdf-upload').style.display = '';
  document.getElementById('pdf-options').classList.remove('visible');
  document.getElementById('pdf-results').classList.remove('visible');
  document.getElementById('pdf-results-grid').innerHTML = '';
  document.getElementById('pdf-progress').classList.remove('visible');
  document.getElementById('pdf-status').classList.remove('visible');
  document.getElementById('pdf-input').value = '';
});

document.getElementById('pdf-convert').addEventListener('click', async () => {
  if (!pdfFile) return;
  if (typeof isPro === 'function' && !isPro()) {
    if (typeof showUpgradeModal === 'function') showUpgradeModal('pdf-a-imagen');
    else alert('PDF a Imagen es una feature Pro');
    return;
  }
  const format = document.getElementById('pdf-format').value;
  const quality = parseInt(document.getElementById('pdf-quality').value) / 100;
  const scale = parseInt(document.getElementById('pdf-scale').value);
  const ext = format === 'jpeg' ? 'jpg' : 'png';
  const mimeType = 'image/' + format;

  const btn = document.getElementById('pdf-convert');
  btn.disabled = true;
  btn.textContent = 'Convirtiendo...';

  const progress = document.getElementById('pdf-progress');
  const progressFill = document.getElementById('pdf-progress-fill');
  const status = document.getElementById('pdf-status');
  const resultsGrid = document.getElementById('pdf-results-grid');

  progress.classList.add('visible');
  status.classList.add('visible');
  resultsGrid.innerHTML = '';
  pdfResultItems = [];

  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;

    status.textContent = `Procesando ${totalPages} paginas...`;

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, quality));
      const url = URL.createObjectURL(blob);
      const name = `pagina-${i}.${ext}`;
      pdfResultItems.push(createResultCard(resultsGrid, url, name, blob));
      progressFill.style.width = ((i / totalPages) * 100) + '%';
      status.textContent = `Pagina ${i} de ${totalPages}`;
    }

    document.getElementById('pdf-results').classList.add('visible');
    status.textContent = `${totalPages} paginas convertidas`;
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    console.error(err);
  }

  btn.disabled = false;
  btn.textContent = 'Convertir';
});

document.getElementById('pdf-download-all').addEventListener('click', () => {
  if (pdfResultItems.length) downloadZip(pdfResultItems, 'pdf-paginas.zip');
});

// ═══════════════════════ SPLIT PDF ═══════════════════════
let splitFile = null;
let splitTotalPages = 0;
const splitSelectedPages = new Set();

setupUpload('split-upload', 'split-input', async files => {
  splitFile = files[0];
  if (!splitFile || !splitFile.name.toLowerCase().endsWith('.pdf')) {
    alert('Por favor selecciona un archivo PDF');
    return;
  }

  const arrayBuffer = await splitFile.arrayBuffer();
  const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
  splitTotalPages = pdf.getPageCount();

  document.getElementById('split-upload').style.display = 'none';
  document.getElementById('split-options').classList.add('visible');
  document.getElementById('split-info').textContent = `${splitFile.name} — ${splitTotalPages} paginas`;

  const container = document.getElementById('split-pages');
  container.innerHTML = '';
  splitSelectedPages.clear();

  for (let i = 1; i <= splitTotalPages; i++) {
    const div = document.createElement('div');
    div.className = 'page-check selected';
    div.textContent = i;
    div.dataset.page = i;
    splitSelectedPages.add(i);
    div.addEventListener('click', () => {
      div.classList.toggle('selected');
      if (splitSelectedPages.has(i)) splitSelectedPages.delete(i);
      else splitSelectedPages.add(i);
    });
    container.appendChild(div);
  }
});

document.getElementById('split-select-all').addEventListener('click', () => {
  splitSelectedPages.clear();
  document.querySelectorAll('#split-pages .page-check').forEach(d => {
    d.classList.add('selected');
    splitSelectedPages.add(parseInt(d.dataset.page));
  });
});
document.getElementById('split-select-none').addEventListener('click', () => {
  splitSelectedPages.clear();
  document.querySelectorAll('#split-pages .page-check').forEach(d => d.classList.remove('selected'));
});
document.getElementById('split-select-odd').addEventListener('click', () => {
  splitSelectedPages.clear();
  document.querySelectorAll('#split-pages .page-check').forEach(d => {
    const p = parseInt(d.dataset.page);
    if (p % 2 === 1) { d.classList.add('selected'); splitSelectedPages.add(p); }
    else d.classList.remove('selected');
  });
});
document.getElementById('split-select-even').addEventListener('click', () => {
  splitSelectedPages.clear();
  document.querySelectorAll('#split-pages .page-check').forEach(d => {
    const p = parseInt(d.dataset.page);
    if (p % 2 === 0) { d.classList.add('selected'); splitSelectedPages.add(p); }
    else d.classList.remove('selected');
  });
});

document.getElementById('split-go').addEventListener('click', async () => {
  if (!splitFile || splitSelectedPages.size === 0) {
    alert('Selecciona al menos una pagina');
    return;
  }
  if (typeof isPro === 'function' && !isPro()) {
    if (typeof showUpgradeModal === 'function') showUpgradeModal('separar-pdf');
    else alert('Separar PDF es una feature Pro');
    return;
  }

  const btn = document.getElementById('split-go');
  btn.disabled = true;
  btn.textContent = 'Procesando...';

  const progress = document.getElementById('split-progress');
  const progressFill = document.getElementById('split-progress-fill');
  const status = document.getElementById('split-status');
  progress.classList.add('visible');
  status.classList.add('visible');

  try {
    const arrayBuffer = await splitFile.arrayBuffer();
    const srcPdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const mode = document.getElementById('split-mode').value;
    const sorted = Array.from(splitSelectedPages).sort((a, b) => a - b);
    const baseName = splitFile.name.replace(/\.pdf$/i, '');

    if (mode === 'single') {
      status.textContent = 'Creando PDF con paginas seleccionadas...';
      const newPdf = await PDFLib.PDFDocument.create();
      const pages = await newPdf.copyPages(srcPdf, sorted.map(p => p - 1));
      pages.forEach(p => newPdf.addPage(p));
      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      downloadBlob(blob, `${baseName}-separado.pdf`);
      progressFill.style.width = '100%';
      status.textContent = `PDF creado con ${sorted.length} paginas`;
    } else {
      for (let i = 0; i < sorted.length; i++) {
        const pageNum = sorted[i];
        status.textContent = `Creando PDF pagina ${pageNum}...`;
        const newPdf = await PDFLib.PDFDocument.create();
        const [page] = await newPdf.copyPages(srcPdf, [pageNum - 1]);
        newPdf.addPage(page);
        const bytes = await newPdf.save();
        const blob = new Blob([bytes], { type: 'application/pdf' });
        downloadBlob(blob, `${baseName}-pagina-${pageNum}.pdf`);
        progressFill.style.width = (((i + 1) / sorted.length) * 100) + '%';
      }
      status.textContent = `${sorted.length} archivos PDF descargados`;
    }
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    console.error(err);
  }

  btn.disabled = false;
  btn.textContent = 'Separar';
});

document.getElementById('split-reset').addEventListener('click', () => {
  splitFile = null;
  splitTotalPages = 0;
  splitSelectedPages.clear();
  document.getElementById('split-upload').style.display = '';
  document.getElementById('split-options').classList.remove('visible');
  document.getElementById('split-progress').classList.remove('visible');
  document.getElementById('split-status').classList.remove('visible');
  document.getElementById('split-pages').innerHTML = '';
  document.getElementById('split-input').value = '';
});

// ═══════════════════════ MERGE PDF ═══════════════════════
let mergeFiles = [];

function renderMergeList() {
  const list = document.getElementById('merge-list');
  list.innerHTML = '';

  mergeFiles.forEach((file, idx) => {
    const item = document.createElement('div');
    item.className = 'merge-item';
    item.innerHTML = `
      <span class="num">${idx + 1}</span>
      <span class="fname">${file.name}</span>
      <span class="pages">${file._pageCount || '...'} pag</span>
      <button class="move-btn" data-dir="up" data-idx="${idx}" title="Subir">&uarr;</button>
      <button class="move-btn" data-dir="down" data-idx="${idx}" title="Bajar">&darr;</button>
      <button class="remove-btn" data-idx="${idx}" title="Quitar">&times;</button>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll('.move-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.idx);
      const dir = btn.dataset.dir;
      if (dir === 'up' && i > 0) [mergeFiles[i], mergeFiles[i - 1]] = [mergeFiles[i - 1], mergeFiles[i]];
      else if (dir === 'down' && i < mergeFiles.length - 1) [mergeFiles[i], mergeFiles[i + 1]] = [mergeFiles[i + 1], mergeFiles[i]];
      renderMergeList();
    });
  });
  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      mergeFiles.splice(parseInt(btn.dataset.idx), 1);
      renderMergeList();
      if (!mergeFiles.length) {
        document.getElementById('merge-actions').style.display = 'none';
        document.getElementById('merge-upload').style.display = '';
        document.getElementById('merge-batch-info').classList.remove('visible');
      } else {
        document.getElementById('merge-batch-info').textContent = `${mergeFiles.length} archivos PDF`;
      }
    });
  });
}

async function addMergeFiles(files) {
  const pdfs = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.pdf'));
  if (!pdfs.length) { alert('Selecciona archivos PDF'); return; }

  for (const file of pdfs) {
    try {
      const ab = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(ab);
      file._pageCount = pdf.getPageCount();
      file._bytes = ab;
    } catch (e) {
      file._pageCount = '?';
      file._bytes = await file.arrayBuffer();
    }
    mergeFiles.push(file);
  }

  document.getElementById('merge-upload').style.display = 'none';
  document.getElementById('merge-actions').style.display = 'flex';
  const info = document.getElementById('merge-batch-info');
  info.textContent = `${mergeFiles.length} archivos PDF`;
  info.classList.add('visible');
  renderMergeList();
}

setupUpload('merge-upload', 'merge-input', addMergeFiles);

document.getElementById('merge-add').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf';
  input.multiple = true;
  input.addEventListener('change', () => { if (input.files.length) addMergeFiles(input.files); });
  input.click();
});

document.getElementById('merge-go').addEventListener('click', async () => {
  if (mergeFiles.length < 2) { alert('Agrega al menos 2 PDFs para unir'); return; }
  if (typeof isPro === 'function' && !isPro()) {
    if (typeof showUpgradeModal === 'function') showUpgradeModal('unir-pdf');
    else alert('Unir PDF es una feature Pro');
    return;
  }

  const btn = document.getElementById('merge-go');
  btn.disabled = true;
  btn.textContent = 'Uniendo...';

  const progress = document.getElementById('merge-progress');
  const progressFill = document.getElementById('merge-progress-fill');
  const status = document.getElementById('merge-status');
  progress.classList.add('visible');
  status.classList.add('visible');

  try {
    const merged = await PDFLib.PDFDocument.create();
    for (let i = 0; i < mergeFiles.length; i++) {
      status.textContent = `Procesando ${mergeFiles[i].name} (${i + 1}/${mergeFiles.length})...`;
      const srcPdf = await PDFLib.PDFDocument.load(mergeFiles[i]._bytes);
      const pages = await merged.copyPages(srcPdf, srcPdf.getPageIndices());
      pages.forEach(p => merged.addPage(p));
      progressFill.style.width = (((i + 1) / mergeFiles.length) * 100) + '%';
    }
    const bytes = await merged.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    downloadBlob(blob, 'documento-unido.pdf');
    const totalPages = merged.getPageCount();
    status.textContent = `PDF unido: ${totalPages} paginas de ${mergeFiles.length} archivos`;
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    console.error(err);
  }

  btn.disabled = false;
  btn.textContent = 'Unir PDFs';
});

document.getElementById('merge-reset').addEventListener('click', () => {
  mergeFiles = [];
  document.getElementById('merge-list').innerHTML = '';
  document.getElementById('merge-upload').style.display = '';
  document.getElementById('merge-actions').style.display = 'none';
  document.getElementById('merge-progress').classList.remove('visible');
  document.getElementById('merge-status').classList.remove('visible');
  document.getElementById('merge-batch-info').classList.remove('visible');
  document.getElementById('merge-input').value = '';
});

// ═══════════════════════ EDIT PDF ═══════════════════════
let editFile = null;
let editPages = [];
let editPdfBytes = null;

async function renderEditThumbnail(canvas, pdfBytes, pageIndex, rotation) {
  const pdf = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
  const page = await pdf.getPage(pageIndex + 1);
  const vp = page.getViewport({ scale: 0.5, rotation });
  canvas.width = vp.width;
  canvas.height = vp.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
}

async function renderEditCards() {
  const container = document.getElementById('edit-pages');
  container.innerHTML = '';

  for (let i = 0; i < editPages.length; i++) {
    const ep = editPages[i];
    const card = document.createElement('div');
    card.className = 'edit-page-card';

    const badge = document.createElement('div');
    badge.className = 'rotation-badge' + (ep.rotation ? ' visible' : '');
    badge.textContent = ep.rotation + '\u00B0';
    card.appendChild(badge);

    const canvas = document.createElement('canvas');
    card.appendChild(canvas);
    renderEditThumbnail(canvas, editPdfBytes, ep.index, ep.rotation);

    const bar = document.createElement('div');
    bar.className = 'edit-bar';

    const leftBtn = document.createElement('button');
    leftBtn.className = 'edit-btn move-btn';
    leftBtn.innerHTML = '&#8592;';
    leftBtn.title = 'Mover izquierda';
    leftBtn.addEventListener('click', () => {
      if (i > 0) { [editPages[i], editPages[i - 1]] = [editPages[i - 1], editPages[i]]; renderEditCards(); }
    });
    bar.appendChild(leftBtn);

    const num = document.createElement('span');
    num.className = 'page-num';
    num.textContent = ep.index + 1;
    bar.appendChild(num);

    const rightBtn = document.createElement('button');
    rightBtn.className = 'edit-btn move-btn';
    rightBtn.innerHTML = '&#8594;';
    rightBtn.title = 'Mover derecha';
    rightBtn.addEventListener('click', () => {
      if (i < editPages.length - 1) { [editPages[i], editPages[i + 1]] = [editPages[i + 1], editPages[i]]; renderEditCards(); }
    });
    bar.appendChild(rightBtn);

    const rotBtn = document.createElement('button');
    rotBtn.className = 'edit-btn rotate-btn';
    rotBtn.innerHTML = '&#8635;';
    rotBtn.title = 'Rotar 90\u00B0';
    rotBtn.addEventListener('click', () => {
      ep.rotation = (ep.rotation + 90) % 360;
      renderEditCards();
    });
    bar.appendChild(rotBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'edit-btn delete-btn';
    delBtn.innerHTML = '&#10005;';
    delBtn.title = 'Eliminar pagina';
    delBtn.addEventListener('click', () => {
      if (editPages.length <= 1) { alert('No puedes eliminar la ultima pagina'); return; }
      editPages.splice(i, 1);
      renderEditCards();
      document.getElementById('edit-info').textContent = `${editFile.name} — ${editPages.length} paginas`;
    });
    bar.appendChild(delBtn);

    card.appendChild(bar);
    container.appendChild(card);
  }
}

setupUpload('edit-upload', 'edit-input', async files => {
  editFile = files[0];
  if (!editFile || !editFile.name.toLowerCase().endsWith('.pdf')) {
    alert('Por favor selecciona un archivo PDF');
    return;
  }
  editPdfBytes = await editFile.arrayBuffer();
  const pdf = await PDFLib.PDFDocument.load(editPdfBytes);
  const total = pdf.getPageCount();
  editPages = [];
  for (let i = 0; i < total; i++) editPages.push({ index: i, rotation: 0 });
  document.getElementById('edit-upload').style.display = 'none';
  document.getElementById('edit-options').classList.add('visible');
  document.getElementById('edit-info').textContent = `${editFile.name} — ${total} paginas`;
  renderEditCards();
});

document.getElementById('edit-save').addEventListener('click', async () => {
  if (!editPdfBytes || !editPages.length) return;
  const btn = document.getElementById('edit-save');
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  const status = document.getElementById('edit-status');
  status.classList.add('visible');
  status.textContent = 'Creando PDF editado...';

  try {
    const srcPdf = await PDFLib.PDFDocument.load(editPdfBytes);
    const newPdf = await PDFLib.PDFDocument.create();
    const indices = editPages.map(ep => ep.index);
    const copiedPages = await newPdf.copyPages(srcPdf, indices);
    for (let i = 0; i < copiedPages.length; i++) {
      const page = copiedPages[i];
      const rotation = editPages[i].rotation;
      if (rotation) {
        const current = page.getRotation().angle;
        page.setRotation(PDFLib.degrees(current + rotation));
      }
      newPdf.addPage(page);
    }
    const bytes = await newPdf.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const baseName = editFile.name.replace(/\.pdf$/i, '');
    downloadBlob(blob, `${baseName}-editado.pdf`);
    status.textContent = `PDF guardado: ${editPages.length} paginas`;
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    console.error(err);
  }

  btn.disabled = false;
  btn.textContent = 'Guardar PDF';
});

document.getElementById('edit-reset').addEventListener('click', () => {
  editFile = null;
  editPdfBytes = null;
  editPages = [];
  document.getElementById('edit-upload').style.display = '';
  document.getElementById('edit-options').classList.remove('visible');
  document.getElementById('edit-status').classList.remove('visible');
  document.getElementById('edit-pages').innerHTML = '';
  document.getElementById('edit-input').value = '';
});

})();
