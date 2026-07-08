/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — eraser.js
   Borrador manual sobre imagen: pintas con alpha=0 para quitar.
   Real-time usando offscreen canvas como _element de la imagen.
   ═══════════════════════════════════════════════════════════════ */

(function() {
'use strict';

let active = false;
let targetImg = null;
let eraseCanvas = null;
let eraseCtx = null;
let originalElement = null;
let isDrawing = false;
let lastPoint = null;
let brushRadius = 30;
let brushHardness = 0.85;
let cursorEl = null;
let bar = null;

function enable() {
  const sel = canvas.getActiveObject();
  if (!sel || sel.type !== 'image') {
    alert('Selecciona primero una imagen para borrar');
    return;
  }
  if (active) return disable();
  active = true;
  targetImg = sel;

  const el = sel._element || sel.getElement();
  const w = el.naturalWidth || el.width;
  const h = el.naturalHeight || el.height;

  // Create offscreen canvas with current image pixels
  eraseCanvas = document.createElement('canvas');
  eraseCanvas.width = w;
  eraseCanvas.height = h;
  eraseCtx = eraseCanvas.getContext('2d');
  eraseCtx.drawImage(el, 0, 0);

  // Redirect Fabric to read from the canvas (real-time)
  originalElement = sel._element;
  sel._element = eraseCanvas;
  sel._originalElement = eraseCanvas;
  sel.dirty = true;
  canvas.requestRenderAll();

  // Lock the image so it doesn't get dragged
  sel._eraserLocked = {
    selectable: sel.selectable, evented: sel.evented,
    lockMovementX: sel.lockMovementX, lockMovementY: sel.lockMovementY,
    lockScalingX: sel.lockScalingX, lockScalingY: sel.lockScalingY,
  };
  sel.set({
    selectable: false, evented: false,
    lockMovementX: true, lockMovementY: true,
    lockScalingX: true, lockScalingY: true,
  });
  canvas.selection = false;
  canvas.defaultCursor = 'none';
  canvas.hoverCursor = 'none';
  document.body.classList.add('eraser-mode');

  canvas.on('mouse:down', onDown);
  canvas.on('mouse:move', onMove);
  canvas.on('mouse:up', onUp);
  document.addEventListener('keydown', onKey);

  createCursor();
  createBar();

  status('Borrador — arrastra sobre la imagen (Esc = salir, [ ] = tamaño)');
}

function disable() {
  if (!active) return;
  active = false;
  canvas.off('mouse:down', onDown);
  canvas.off('mouse:move', onMove);
  canvas.off('mouse:up', onUp);
  document.removeEventListener('keydown', onKey);

  // Commit: replace img src with the modified canvas's dataURL
  if (targetImg) {
    const dataUrl = eraseCanvas.toDataURL('image/png');
    targetImg.setSrc(dataUrl, () => {
      if (targetImg._eraserLocked) {
        targetImg.set(targetImg._eraserLocked);
        delete targetImg._eraserLocked;
      }
      canvas.requestRenderAll();
      if (typeof saveState === 'function') saveState();
    });
  }

  canvas.selection = true;
  canvas.defaultCursor = 'default';
  canvas.hoverCursor = 'move';
  document.body.classList.remove('eraser-mode');

  if (cursorEl) { cursorEl.remove(); cursorEl = null; }
  if (bar) { bar.remove(); bar = null; }

  targetImg = null;
  eraseCanvas = null;
  eraseCtx = null;
  originalElement = null;
  isDrawing = false;
  lastPoint = null;
}

function onKey(e) {
  if (e.key === 'Escape') disable();
  else if (e.key === '[') setBrushRadius(Math.max(2, brushRadius - 5));
  else if (e.key === ']') setBrushRadius(Math.min(200, brushRadius + 5));
}

function setBrushRadius(r) {
  brushRadius = r;
  if (cursorEl) updateCursorSize();
  if (bar) {
    const rSlider = bar.querySelector('#eraserSize');
    const rVal = bar.querySelector('#eraserSizeVal');
    if (rSlider) rSlider.value = r;
    if (rVal) rVal.textContent = r + 'px';
  }
}

function onDown(opt) {
  const p = canvas.getPointer(opt.e);
  if (!isInsideImage(p)) return;
  isDrawing = true;
  lastPoint = toImagePixel(p);
  paintCircle(lastPoint.x, lastPoint.y);
  canvas.requestRenderAll();
}

function onMove(opt) {
  const p = canvas.getPointer(opt.e);
  updateCursorPos(opt.e);
  if (!isDrawing) return;
  const cur = toImagePixel(p);
  // Interpolate between lastPoint and cur for smooth strokes
  const dx = cur.x - lastPoint.x;
  const dy = cur.y - lastPoint.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const step = Math.max(1, brushRadius * 0.25);
  const steps = Math.ceil(dist / step);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    paintCircle(lastPoint.x + dx * t, lastPoint.y + dy * t);
  }
  lastPoint = cur;
  canvas.requestRenderAll();
}

function onUp() {
  isDrawing = false;
  lastPoint = null;
}

function isInsideImage(p) {
  const ib = targetImg.getBoundingRect(true, true);
  return p.x >= ib.left && p.x <= ib.left + ib.width
      && p.y >= ib.top && p.y <= ib.top + ib.height;
}

function toImagePixel(p) {
  const ib = targetImg.getBoundingRect(true, true);
  return {
    x: (p.x - ib.left) / (targetImg.scaleX || 1),
    y: (p.y - ib.top) / (targetImg.scaleY || 1),
  };
}

function paintCircle(x, y) {
  eraseCtx.save();
  eraseCtx.globalCompositeOperation = 'destination-out';

  // Soft brush via radial gradient if hardness < 1
  if (brushHardness < 1) {
    const grad = eraseCtx.createRadialGradient(x, y, brushRadius * brushHardness, x, y, brushRadius);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    eraseCtx.fillStyle = grad;
  } else {
    eraseCtx.fillStyle = 'rgba(0,0,0,1)';
  }
  eraseCtx.beginPath();
  eraseCtx.arc(x, y, brushRadius, 0, Math.PI * 2);
  eraseCtx.fill();
  eraseCtx.restore();

  targetImg.dirty = true;
}

// ───────────── Cursor visual ─────────────
function createCursor() {
  cursorEl = document.createElement('div');
  cursorEl.className = 'eraser-cursor';
  document.body.appendChild(cursorEl);
  updateCursorSize();

  document.addEventListener('mousemove', updateCursorPos);
}

function updateCursorSize() {
  if (!cursorEl) return;
  const zoom = canvas.getZoom() * (targetImg ? (targetImg.scaleX || 1) : 1);
  const size = brushRadius * 2 * zoom;
  cursorEl.style.width = size + 'px';
  cursorEl.style.height = size + 'px';
}

function updateCursorPos(e) {
  if (!cursorEl) return;
  const x = (e.clientX !== undefined) ? e.clientX : (e.e && e.e.clientX);
  const y = (e.clientY !== undefined) ? e.clientY : (e.e && e.e.clientY);
  if (x == null || y == null) return;
  cursorEl.style.left = x + 'px';
  cursorEl.style.top = y + 'px';
}

// ───────────── Bar flotante con controles ─────────────
function createBar() {
  bar = document.createElement('div');
  bar.className = 'crop-bar';
  bar.innerHTML = `
    <span class="crop-msg">Borrador · arrastra sobre la imagen</span>
    <label class="eraser-slider-label">Tamaño <input type="range" id="eraserSize" min="2" max="200" step="1" value="${brushRadius}"> <span id="eraserSizeVal">${brushRadius}px</span></label>
    <label class="eraser-slider-label">Suavidad <input type="range" id="eraserHardness" min="0" max="100" step="5" value="${Math.round((1 - brushHardness) * 100)}"></label>
    <button class="crop-btn crop-apply" id="eraserDone">Listo</button>
  `;
  document.body.appendChild(bar);

  bar.querySelector('#eraserSize').addEventListener('input', e => {
    setBrushRadius(parseInt(e.target.value));
  });
  bar.querySelector('#eraserHardness').addEventListener('input', e => {
    // 0% = hard (hardness 1), 100% = soft (hardness 0.2)
    const pct = parseInt(e.target.value) / 100;
    brushHardness = 1 - pct * 0.8;
  });
  bar.querySelector('#eraserDone').addEventListener('click', disable);
}

window.enableEraserTool = enable;

})();
