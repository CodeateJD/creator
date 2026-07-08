// ═══════════════════════════════════════════════════════════════
// codeateJD Studio — pdf-annotate.js
// Editor de anotaciones sobre PDF (texto, tachar, dibujar,
// resaltar, imagen, firma). Guarda con pdf-lib.
// ═══════════════════════════════════════════════════════════════

(function() {
'use strict';

// Wait for pdf.js worker config (main pdf.js script sets it up)
// ─────────────────────────────────────────────────────────────
let pdfBytes = null;
let pdfDoc = null;          // pdf.js document
let pages = [];             // [{ fabric, bgDataUrl, width, height, rotation }]
let currentPage = 0;
let fabricCanvas = null;
let currentTool = 'select';
let isDrawingShape = false;
let drawStart = null;
let drawingRect = null;

const $ = id => document.getElementById(id);

// ─────────────────────────────────────────────────────────────
// Upload
// ─────────────────────────────────────────────────────────────
const annUpload = $('ann-upload');
const annInput = $('ann-input');
if (annUpload && annInput) {
  annUpload.addEventListener('click', () => annInput.click());
  annInput.addEventListener('change', () => {
    if (annInput.files.length) loadPdf(annInput.files[0]);
  });
  annUpload.addEventListener('dragover', e => { e.preventDefault(); annUpload.classList.add('dragover'); });
  annUpload.addEventListener('dragleave', () => annUpload.classList.remove('dragover'));
  annUpload.addEventListener('drop', e => {
    e.preventDefault();
    annUpload.classList.remove('dragover');
    if (e.dataTransfer.files.length) loadPdf(e.dataTransfer.files[0]);
  });
}

async function loadPdf(file) {
  if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
    alert('Selecciona un archivo PDF');
    return;
  }
  const status = $('ann-status');
  status.classList.add('visible');
  status.textContent = 'Cargando PDF...';

  try {
    pdfBytes = await file.arrayBuffer();
    pdfDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
    pages = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      pages.push({
        fabric: null,
        bgDataUrl: canvas.toDataURL('image/png'),
        width: viewport.width,
        height: viewport.height,
      });
      status.textContent = `Preparando página ${i} de ${pdfDoc.numPages}...`;
    }

    $('ann-upload').style.display = 'none';
    $('ann-editor').classList.add('visible');
    status.classList.remove('visible');

    currentPage = 0;
    renderPage();
    updateNav();
  } catch (err) {
    console.error(err);
    status.textContent = 'Error al cargar: ' + err.message;
  }
}

// ─────────────────────────────────────────────────────────────
// Page rendering with Fabric canvas
// ─────────────────────────────────────────────────────────────
function renderPage() {
  const pageData = pages[currentPage];
  const el = $('ann-canvas');

  if (fabricCanvas) {
    try { fabricCanvas.dispose(); } catch (e) {}
    fabricCanvas = null;
  }

  // Recreate DOM canvas
  const wrapper = $('ann-canvas-wrapper');
  wrapper.innerHTML = '<canvas id="ann-canvas"></canvas>';

  fabricCanvas = new fabric.Canvas('ann-canvas', {
    width: pageData.width,
    height: pageData.height,
    selection: true,
    preserveObjectStacking: true,
  });

  fabric.Image.fromURL(pageData.bgDataUrl, img => {
    img.scaleToWidth(pageData.width);
    fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
  });

  // Re-hydrate existing annotations if any
  if (pageData.fabric) {
    fabricCanvas.loadFromJSON(pageData.fabric, () => fabricCanvas.renderAll());
  }

  applyTool(currentTool);
  attachDrawingListeners();
}

function savePageState() {
  if (fabricCanvas && pages[currentPage]) {
    const json = fabricCanvas.toJSON();
    // Remove background image from serialization to keep size small
    delete json.backgroundImage;
    pages[currentPage].fabric = json;
  }
}

// ─────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────
$('ann-prev').addEventListener('click', () => {
  if (currentPage > 0) {
    savePageState();
    currentPage--;
    renderPage();
    updateNav();
  }
});
$('ann-next').addEventListener('click', () => {
  if (currentPage < pages.length - 1) {
    savePageState();
    currentPage++;
    renderPage();
    updateNav();
  }
});

function updateNav() {
  $('ann-page-info').textContent = `Página ${currentPage + 1} / ${pages.length}`;
  $('ann-prev').disabled = currentPage === 0;
  $('ann-next').disabled = currentPage === pages.length - 1;
}

// ─────────────────────────────────────────────────────────────
// Tool selection
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('.ann-tool[data-ann]').forEach(btn => {
  btn.addEventListener('click', () => {
    const tool = btn.dataset.ann;
    if (tool === 'sign') {
      openSignModal();
      return;
    }
    if (tool === 'image') {
      pickImage();
      return;
    }
    document.querySelectorAll('.ann-tool[data-ann]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = tool;
    applyTool(tool);
  });
});

function applyTool(tool) {
  if (!fabricCanvas) return;
  fabricCanvas.isDrawingMode = false;
  fabricCanvas.selection = tool === 'select';
  fabricCanvas.defaultCursor = 'default';
  fabricCanvas.hoverCursor = 'move';
  fabricCanvas.getObjects().forEach(o => { o.selectable = tool === 'select'; o.evented = tool === 'select'; });

  if (tool === 'draw') {
    fabricCanvas.isDrawingMode = true;
    fabricCanvas.freeDrawingBrush.color = $('ann-color').value;
    fabricCanvas.freeDrawingBrush.width = 2;
  } else if (tool === 'text') {
    fabricCanvas.defaultCursor = 'text';
  } else if (tool === 'cover' || tool === 'highlight') {
    fabricCanvas.defaultCursor = 'crosshair';
  }
}

// ─────────────────────────────────────────────────────────────
// Canvas drawing listeners (text click, rect drag for cover/highlight)
// ─────────────────────────────────────────────────────────────
function attachDrawingListeners() {
  fabricCanvas.on('mouse:down', e => {
    if (currentTool === 'text') {
      const p = fabricCanvas.getPointer(e.e);
      const text = new fabric.IText('Escribe aquí', {
        left: p.x, top: p.y,
        fontFamily: 'Inter',
        fontSize: 18,
        fill: $('ann-color').value,
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      text.enterEditing();
      text.selectAll();
      // After creating the text, switch to select tool
      document.querySelector('.ann-tool[data-ann="select"]').click();
    } else if (currentTool === 'cover' || currentTool === 'highlight') {
      isDrawingShape = true;
      const p = fabricCanvas.getPointer(e.e);
      drawStart = p;
      const isCover = currentTool === 'cover';
      drawingRect = new fabric.Rect({
        left: p.x, top: p.y, width: 0, height: 0,
        fill: isCover ? '#ffffff' : 'rgba(255, 235, 59, 0.45)',
        stroke: isCover ? '#e5e7eb' : 'transparent',
        strokeWidth: isCover ? 1 : 0,
        selectable: false,
      });
      fabricCanvas.add(drawingRect);
    }
  });

  fabricCanvas.on('mouse:move', e => {
    if (!isDrawingShape || !drawingRect) return;
    const p = fabricCanvas.getPointer(e.e);
    drawingRect.set({
      left: Math.min(drawStart.x, p.x),
      top: Math.min(drawStart.y, p.y),
      width: Math.abs(p.x - drawStart.x),
      height: Math.abs(p.y - drawStart.y),
    });
    fabricCanvas.requestRenderAll();
  });

  fabricCanvas.on('mouse:up', () => {
    if (isDrawingShape && drawingRect) {
      drawingRect.set({ selectable: true });
      fabricCanvas.setActiveObject(drawingRect);
      drawingRect = null;
      drawStart = null;
      isDrawingShape = false;
      document.querySelector('.ann-tool[data-ann="select"]').click();
    }
  });
}

// Update brush color when color changes
$('ann-color').addEventListener('input', () => {
  if (fabricCanvas && fabricCanvas.isDrawingMode) {
    fabricCanvas.freeDrawingBrush.color = $('ann-color').value;
  }
  const active = fabricCanvas && fabricCanvas.getActiveObject();
  if (active && active.type === 'i-text') {
    active.set('fill', $('ann-color').value);
    fabricCanvas.requestRenderAll();
  }
});

// ─────────────────────────────────────────────────────────────
// Delete selected
// ─────────────────────────────────────────────────────────────
$('ann-delete').addEventListener('click', () => {
  if (!fabricCanvas) return;
  const active = fabricCanvas.getActiveObjects();
  active.forEach(o => fabricCanvas.remove(o));
  fabricCanvas.discardActiveObject();
  fabricCanvas.requestRenderAll();
});

document.addEventListener('keydown', e => {
  if (!$('pdfModal').classList.contains('open')) return;
  if (!fabricCanvas) return;
  if (e.key === 'Delete' || e.key === 'Backspace') {
    const active = fabricCanvas.getActiveObject();
    if (active && !active.isEditing) {
      e.preventDefault();
      fabricCanvas.getActiveObjects().forEach(o => fabricCanvas.remove(o));
      fabricCanvas.discardActiveObject();
      fabricCanvas.requestRenderAll();
    }
  }
});

// ─────────────────────────────────────────────────────────────
// Image insertion
// ─────────────────────────────────────────────────────────────
function pickImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      fabric.Image.fromURL(reader.result, img => {
        const max = 300;
        if (img.width > max) img.scaleToWidth(max);
        img.set({ left: 50, top: 50 });
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.requestRenderAll();
      });
    };
    reader.readAsDataURL(file);
  });
  input.click();
}

// ─────────────────────────────────────────────────────────────
// Signature modal
// ─────────────────────────────────────────────────────────────
let signModal = null;
let signCanvas = null;
let signCtx = null;
let signDrawing = false;

function buildSignModal() {
  if (signModal) return;
  signModal = document.createElement('div');
  signModal.className = 'ann-sign-modal';
  signModal.innerHTML = `
    <div class="ann-sign-panel">
      <h3>Firma aquí</h3>
      <canvas class="ann-sign-canvas" width="600" height="200"></canvas>
      <div class="ann-sign-actions">
        <button class="pdf-btn pdf-btn-secondary" data-act="clear">Limpiar</button>
        <button class="pdf-btn pdf-btn-secondary" data-act="cancel">Cancelar</button>
        <button class="pdf-btn pdf-btn-primary" data-act="accept">Aceptar</button>
      </div>
    </div>
  `;
  document.body.appendChild(signModal);
  signCanvas = signModal.querySelector('canvas');
  signCtx = signCanvas.getContext('2d');
  signCtx.strokeStyle = '#000';
  signCtx.lineWidth = 2.5;
  signCtx.lineCap = 'round';
  signCtx.lineJoin = 'round';

  const getPos = e => {
    const rect = signCanvas.getBoundingClientRect();
    const scaleX = signCanvas.width / rect.width;
    const scaleY = signCanvas.height / rect.height;
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x: cx * scaleX, y: cy * scaleY };
  };

  const start = e => {
    e.preventDefault();
    signDrawing = true;
    const { x, y } = getPos(e);
    signCtx.beginPath();
    signCtx.moveTo(x, y);
  };
  const move = e => {
    if (!signDrawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    signCtx.lineTo(x, y);
    signCtx.stroke();
  };
  const end = e => {
    if (!signDrawing) return;
    e.preventDefault();
    signDrawing = false;
  };
  signCanvas.addEventListener('mousedown', start);
  signCanvas.addEventListener('mousemove', move);
  signCanvas.addEventListener('mouseup', end);
  signCanvas.addEventListener('mouseleave', end);
  signCanvas.addEventListener('touchstart', start);
  signCanvas.addEventListener('touchmove', move);
  signCanvas.addEventListener('touchend', end);

  signModal.addEventListener('click', e => {
    const act = e.target.dataset && e.target.dataset.act;
    if (!act) return;
    if (act === 'clear') {
      signCtx.clearRect(0, 0, signCanvas.width, signCanvas.height);
    } else if (act === 'cancel') {
      signModal.classList.remove('open');
    } else if (act === 'accept') {
      const dataUrl = signCanvas.toDataURL('image/png');
      fabric.Image.fromURL(dataUrl, img => {
        img.scaleToWidth(200);
        img.set({ left: 50, top: 50 });
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.requestRenderAll();
      });
      signModal.classList.remove('open');
    }
  });
}

function openSignModal() {
  if (!fabricCanvas) { alert('Carga primero un PDF'); return; }
  buildSignModal();
  signCtx.clearRect(0, 0, signCanvas.width, signCanvas.height);
  signModal.classList.add('open');
}

// ─────────────────────────────────────────────────────────────
// Save annotated PDF
// ─────────────────────────────────────────────────────────────
$('ann-save').addEventListener('click', async () => {
  if (!fabricCanvas) return;
  savePageState();

  const btn = $('ann-save');
  btn.disabled = true;
  btn.textContent = 'Guardando...';
  const status = $('ann-status');
  status.classList.add('visible');

  try {
    // Create new Fabric canvas off-screen for each page, render background + annotations, export PNG, embed into PDF
    const newPdf = await PDFLib.PDFDocument.create();

    for (let i = 0; i < pages.length; i++) {
      status.textContent = `Renderizando página ${i + 1} / ${pages.length}...`;
      const p = pages[i];

      // Off-screen Fabric render
      const tmpEl = document.createElement('canvas');
      tmpEl.width = p.width;
      tmpEl.height = p.height;
      const tmpFabric = new fabric.StaticCanvas(tmpEl, { width: p.width, height: p.height });

      await new Promise(resolve => {
        fabric.Image.fromURL(p.bgDataUrl, bg => {
          bg.scaleToWidth(p.width);
          tmpFabric.setBackgroundImage(bg, () => {
            if (p.fabric && p.fabric.objects && p.fabric.objects.length) {
              fabric.util.enlivenObjects(p.fabric.objects, objs => {
                objs.forEach(o => tmpFabric.add(o));
                tmpFabric.renderAll();
                resolve();
              });
            } else {
              tmpFabric.renderAll();
              resolve();
            }
          });
        });
      });

      const pngDataUrl = tmpFabric.toDataURL({ format: 'png' });
      const pngBytes = await fetch(pngDataUrl).then(r => r.arrayBuffer());
      const pngImage = await newPdf.embedPng(pngBytes);

      const pdfPage = newPdf.addPage([p.width, p.height]);
      pdfPage.drawImage(pngImage, { x: 0, y: 0, width: p.width, height: p.height });

      tmpFabric.dispose();
    }

    const bytes = await newPdf.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pdf-anotado.pdf';
    a.click();
    URL.revokeObjectURL(a.href);

    status.textContent = `PDF guardado con ${pages.length} páginas`;
  } catch (err) {
    console.error(err);
    status.textContent = 'Error: ' + err.message;
  }

  btn.disabled = false;
  btn.textContent = 'Guardar PDF';
});

// ─────────────────────────────────────────────────────────────
// Reset
// ─────────────────────────────────────────────────────────────
$('ann-reset').addEventListener('click', () => {
  pdfBytes = null;
  pdfDoc = null;
  pages = [];
  currentPage = 0;
  if (fabricCanvas) {
    try { fabricCanvas.dispose(); } catch (e) {}
    fabricCanvas = null;
  }
  $('ann-editor').classList.remove('visible');
  $('ann-upload').style.display = '';
  $('ann-status').classList.remove('visible');
  $('ann-input').value = '';
});

})();
