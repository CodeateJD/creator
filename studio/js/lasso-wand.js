/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — lasso-wand.js
   Varita mágica (flood-fill transparente) + Lasso (selección libre)
   ═══════════════════════════════════════════════════════════════ */

(function() {
'use strict';

// ═══════════════════════════ VARITA MÁGICA ═══════════════════════════
let wandActive = false;

function enableWand() {
  const sel = canvas.getActiveObject();
  if (!sel || sel.type !== 'image') {
    alert('Selecciona primero una imagen');
    return;
  }
  if (typeof isPro === 'function' && !isPro()) {
    if (typeof showUpgradeModal === 'function') showUpgradeModal('varita');
    else alert('Varita mágica es una feature Pro');
    return;
  }
  if (wandActive) return disableWand();
  wandActive = true;
  canvas.selection = false;
  canvas.defaultCursor = 'crosshair';
  canvas.hoverCursor = 'crosshair';
  document.body.classList.add('fill-mode');
  if (typeof status === 'function') status('Varita mágica — clic sobre zona a quitar (Esc cancela)');
  canvas.off('mouse:down', onWandClick);
  canvas.on('mouse:down', onWandClick);
  document.addEventListener('keydown', onWandKey);
}

function disableWand() {
  wandActive = false;
  canvas.off('mouse:down', onWandClick);
  document.removeEventListener('keydown', onWandKey);
  canvas.selection = true;
  canvas.defaultCursor = 'default';
  canvas.hoverCursor = 'move';
  document.body.classList.remove('fill-mode');
}

function onWandKey(e) {
  if (e.key === 'Escape') disableWand();
}

function onWandClick(opt) {
  if (!wandActive) return;
  const target = opt.target;
  if (!target || target.type !== 'image') {
    if (typeof status === 'function') status('Clic sobre una imagen');
    return;
  }
  const p = canvas.getPointer(opt.e);
  magicWandRemove(target, p.x, p.y);
  disableWand();
}

function magicWandRemove(img, canvasX, canvasY) {
  const el = img._element || img.getElement();
  const w = el.naturalWidth || el.width;
  const h = el.naturalHeight || el.height;
  const ib = img.getBoundingRect(true, true);
  const px = Math.floor((canvasX - ib.left) / (img.scaleX || 1));
  const py = Math.floor((canvasY - ib.top) / (img.scaleY || 1));
  if (px < 0 || py < 0 || px >= w || py >= h) return;

  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const ctx = off.getContext('2d');
  try { ctx.drawImage(el, 0, 0); }
  catch (e) { status('CORS error'); return; }

  let imgData;
  try { imgData = ctx.getImageData(0, 0, w, h); }
  catch (e) { status('Imagen bloqueada'); return; }

  const data = imgData.data;
  const startIdx = (py * w + px) * 4;
  const sR = data[startIdx], sG = data[startIdx+1], sB = data[startIdx+2], sA = data[startIdx+3];
  const tol = 32;
  const tolSq = tol * tol * 3;
  const visited = new Uint8Array(w * h);
  const stack = [px, py];
  const startTransparent = sA < 128;

  let count = 0;
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = y * w + x;
    if (visited[idx]) continue;
    visited[idx] = 1;
    const di = idx * 4;
    const a = data[di + 3];

    if (startTransparent) {
      if (a >= 128) continue;
    } else {
      if (a < 128) continue;
      const dr = data[di] - sR;
      const dg = data[di+1] - sG;
      const db = data[di+2] - sB;
      if (dr*dr + dg*dg + db*db > tolSq) continue;
    }

    data[di + 3] = 0;
    count++;

    stack.push(x+1, y);
    stack.push(x-1, y);
    stack.push(x, y+1);
    stack.push(x, y-1);
  }

  ctx.putImageData(imgData, 0, 0);
  const dataUrl = off.toDataURL('image/png');
  img.setSrc(dataUrl, () => {
    canvas.requestRenderAll();
    if (typeof saveState === 'function') saveState();
    if (typeof status === 'function') status(`✓ ${count.toLocaleString()} píxeles quitados`);
  });
}

window.enableWandTool = enableWand;

// ═══════════════════════════ LASSO (selección libre) ═══════════════════════════
let lassoActive = false;
let lassoImg = null;
let lassoCanvas = null;
let lassoCtx = null;
let lassoPoints = [];
let lassoDrawing = false;
let lassoImgLocked = null;
let lassoOriginalElement = null;
let lassoBar = null;

function enableLasso() {
  const sel = canvas.getActiveObject();
  if (!sel || sel.type !== 'image') {
    alert('Selecciona primero una imagen');
    return;
  }
  if (typeof isPro === 'function' && !isPro()) {
    if (typeof showUpgradeModal === 'function') showUpgradeModal('lasso');
    else alert('Lasso es una feature Pro');
    return;
  }
  if (lassoActive) return cancelLasso();
  lassoActive = true;
  lassoImg = sel;
  lassoPoints = [];

  const el = sel._element || sel.getElement();
  const w = el.naturalWidth || el.width;
  const h = el.naturalHeight || el.height;
  lassoCanvas = document.createElement('canvas');
  lassoCanvas.width = w;
  lassoCanvas.height = h;
  lassoCtx = lassoCanvas.getContext('2d');
  lassoCtx.drawImage(el, 0, 0);

  lassoOriginalElement = sel._element;
  sel._element = lassoCanvas;
  sel._originalElement = lassoCanvas;
  sel.dirty = true;
  canvas.requestRenderAll();

  lassoImgLocked = {
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
  canvas.defaultCursor = 'crosshair';
  canvas.hoverCursor = 'crosshair';
  document.body.classList.add('fill-mode');

  canvas.on('mouse:down', onLassoDown);
  canvas.on('mouse:move', onLassoMove);
  canvas.on('mouse:up', onLassoUp);
  document.addEventListener('keydown', onLassoKey);

  createLassoBar();
  if (typeof status === 'function') status('Lasso — dibuja un contorno alrededor de lo que quieres quitar');
}

function createLassoBar() {
  lassoBar = document.createElement('div');
  lassoBar.className = 'crop-bar';
  lassoBar.innerHTML = `
    <span class="crop-msg">Lasso · arrastra para dibujar contorno</span>
    <button class="crop-btn crop-cancel" id="lassoCancel">Cancelar</button>
  `;
  document.body.appendChild(lassoBar);
  lassoBar.querySelector('#lassoCancel').addEventListener('click', cancelLasso);
}

function cancelLasso() {
  if (!lassoActive) return;
  // Restore original image (no changes committed)
  if (lassoImg && lassoOriginalElement) {
    lassoImg._element = lassoOriginalElement;
    lassoImg._originalElement = lassoOriginalElement;
    lassoImg.dirty = true;
  }
  cleanupLasso();
  if (typeof status === 'function') status('Lasso cancelado');
}

function cleanupLasso() {
  canvas.off('mouse:down', onLassoDown);
  canvas.off('mouse:move', onLassoMove);
  canvas.off('mouse:up', onLassoUp);
  document.removeEventListener('keydown', onLassoKey);
  if (lassoImg && lassoImgLocked) {
    lassoImg.set(lassoImgLocked);
    lassoImgLocked = null;
  }
  canvas.selection = true;
  canvas.defaultCursor = 'default';
  canvas.hoverCursor = 'move';
  document.body.classList.remove('fill-mode');
  if (lassoBar) { lassoBar.remove(); lassoBar = null; }
  canvas.requestRenderAll();

  lassoActive = false;
  lassoImg = null;
  lassoCanvas = null;
  lassoCtx = null;
  lassoPoints = [];
  lassoDrawing = false;
  lassoOriginalElement = null;
}

function onLassoKey(e) {
  if (e.key === 'Escape') cancelLasso();
}

function onLassoDown(opt) {
  const p = canvas.getPointer(opt.e);
  lassoDrawing = true;
  lassoPoints = [toImgPoint(p)];
  drawLassoPreview();
}

function onLassoMove(opt) {
  if (!lassoDrawing) return;
  const p = canvas.getPointer(opt.e);
  const ip = toImgPoint(p);
  const last = lassoPoints[lassoPoints.length - 1];
  const dx = ip.x - last.x;
  const dy = ip.y - last.y;
  if (dx * dx + dy * dy > 4) {
    lassoPoints.push(ip);
    drawLassoPreview();
  }
}

function onLassoUp() {
  if (!lassoDrawing) return;
  lassoDrawing = false;
  if (lassoPoints.length < 3) {
    if (typeof status === 'function') status('Trazo muy corto, intenta de nuevo');
    return;
  }
  commitLassoRemove();
}

function toImgPoint(p) {
  const ib = lassoImg.getBoundingRect(true, true);
  return {
    x: (p.x - ib.left) / (lassoImg.scaleX || 1),
    y: (p.y - ib.top) / (lassoImg.scaleY || 1),
  };
}

function drawLassoPreview() {
  // Re-draw the image fresh
  const el = lassoOriginalElement;
  lassoCtx.globalCompositeOperation = 'source-over';
  lassoCtx.clearRect(0, 0, lassoCanvas.width, lassoCanvas.height);
  lassoCtx.drawImage(el, 0, 0);

  // Overlay the lasso path as visual guide
  if (lassoPoints.length > 1) {
    lassoCtx.save();
    lassoCtx.strokeStyle = '#667eea';
    lassoCtx.lineWidth = 2;
    lassoCtx.setLineDash([6, 4]);
    lassoCtx.beginPath();
    lassoCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
    for (let i = 1; i < lassoPoints.length; i++) {
      lassoCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
    }
    lassoCtx.stroke();
    lassoCtx.restore();
  }

  lassoImg.dirty = true;
  canvas.requestRenderAll();
}

function commitLassoRemove() {
  // Redraw image fresh then cut polygon
  const el = lassoOriginalElement;
  lassoCtx.globalCompositeOperation = 'source-over';
  lassoCtx.clearRect(0, 0, lassoCanvas.width, lassoCanvas.height);
  lassoCtx.drawImage(el, 0, 0);

  lassoCtx.globalCompositeOperation = 'destination-out';
  lassoCtx.beginPath();
  lassoCtx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
  for (let i = 1; i < lassoPoints.length; i++) {
    lassoCtx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
  }
  lassoCtx.closePath();
  lassoCtx.fill();

  // Commit via setSrc
  const dataUrl = lassoCanvas.toDataURL('image/png');
  lassoImg.setSrc(dataUrl, () => {
    canvas.requestRenderAll();
    if (typeof saveState === 'function') saveState();
    if (typeof status === 'function') status('✓ Área recortada con lasso');
    cleanupLasso();
  });
}

window.enableLassoTool = enableLasso;

})();
