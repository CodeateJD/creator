/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — crop.js
   Modo recorte de imagen: rectángulo editable + aplicar/cancelar
   ═══════════════════════════════════════════════════════════════ */

(function() {
'use strict';

let cropState = null;
// { originalImg, rect, bar, prevAngle, prevSelection }

function startCrop(img) {
  if (!img || img.type !== 'image') return;
  if (cropState) return;

  // Get image bounding box in canvas coords
  const b = img.getBoundingRect(true, true);

  // Dim overlay rect (starts covering 80% of image)
  const pad = Math.min(b.width, b.height) * 0.1;
  const rect = new fabric.Rect({
    left: b.left + pad,
    top: b.top + pad,
    width: b.width - pad * 2,
    height: b.height - pad * 2,
    fill: 'rgba(255,255,255,0.02)',
    stroke: '#667eea',
    strokeWidth: 2,
    strokeDashArray: [6, 4],
    cornerColor: '#fff',
    cornerStrokeColor: '#667eea',
    cornerSize: 12,
    transparentCorners: false,
    hasRotatingPoint: false,
    lockRotation: true,
    _studioCrop: true,
  });
  rect.setControlsVisibility({ mtr: false });

  // Lock the image so it doesn't get dragged
  img._cropLocked = {
    selectable: img.selectable,
    evented: img.evented,
    lockMovementX: img.lockMovementX,
    lockMovementY: img.lockMovementY,
    lockScalingX: img.lockScalingX,
    lockScalingY: img.lockScalingY,
  };
  img.set({
    selectable: false,
    evented: false,
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
  });

  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.requestRenderAll();

  // Floating action bar
  const bar = document.createElement('div');
  bar.className = 'crop-bar';
  bar.innerHTML = `
    <span class="crop-msg">Ajusta el rectángulo sobre la zona a conservar</span>
    <button class="crop-btn crop-cancel" id="cropCancel">Cancelar</button>
    <button class="crop-btn crop-apply" id="cropApply">Aplicar recorte</button>
  `;
  document.body.appendChild(bar);
  bar.querySelector('#cropCancel').addEventListener('click', cancelCrop);
  bar.querySelector('#cropApply').addEventListener('click', applyCrop);

  cropState = { originalImg: img, rect, bar };

  document.addEventListener('keydown', onCropKey);
  status('Modo recorte — Enter = aplicar, Esc = cancelar');
}

function onCropKey(e) {
  if (!cropState) return;
  if (e.key === 'Escape') cancelCrop();
  else if (e.key === 'Enter') applyCrop();
}

function cancelCrop() {
  if (!cropState) return;
  const { originalImg, rect, bar } = cropState;
  canvas.remove(rect);
  if (originalImg._cropLocked) {
    originalImg.set(originalImg._cropLocked);
    delete originalImg._cropLocked;
  }
  canvas.setActiveObject(originalImg);
  canvas.requestRenderAll();
  bar.remove();
  document.removeEventListener('keydown', onCropKey);
  cropState = null;
  status('Recorte cancelado');
}

function applyCrop() {
  if (!cropState) return;
  const { originalImg: img, rect, bar } = cropState;

  // Rect's bounding box in canvas coordinates
  const rb = rect.getBoundingRect(true, true);
  const ib = img.getBoundingRect(true, true);

  // Intersection (clamp to image bounds)
  const xCanvas = Math.max(rb.left, ib.left);
  const yCanvas = Math.max(rb.top, ib.top);
  const rightCanvas = Math.min(rb.left + rb.width, ib.left + ib.width);
  const botCanvas = Math.min(rb.top + rb.height, ib.top + ib.height);
  const wCanvas = rightCanvas - xCanvas;
  const hCanvas = botCanvas - yCanvas;

  if (wCanvas <= 2 || hCanvas <= 2) {
    alert('Rectángulo muy pequeño');
    return;
  }

  // Convert to source pixel coords (undo scale of image, ignoring rotation)
  const sx = (xCanvas - ib.left) / (img.scaleX || 1);
  const sy = (yCanvas - ib.top) / (img.scaleY || 1);
  const sw = wCanvas / (img.scaleX || 1);
  const sh = hCanvas / (img.scaleY || 1);

  // Draw to offscreen canvas
  const off = document.createElement('canvas');
  off.width = Math.round(sw);
  off.height = Math.round(sh);
  const ctx = off.getContext('2d');

  const el = img._element || img.getElement();
  try {
    ctx.drawImage(el, sx, sy, sw, sh, 0, 0, off.width, off.height);
  } catch (err) {
    console.error('Crop drawImage failed', err);
    alert('Error al recortar. La imagen puede estar en modo tainted (cross-origin).');
    return;
  }

  const dataUrl = off.toDataURL('image/png');

  // Replace image: preserve position/angle/scale-adjusted to keep visual size
  fabric.Image.fromURL(dataUrl, newImg => {
    newImg.set({
      left: xCanvas,
      top: yCanvas,
      originX: 'left',
      originY: 'top',
      angle: 0, // crop flattens rotation for simplicity
      scaleX: 1,
      scaleY: 1,
    });
    // Make displayed size match the rect's visual size
    newImg.scaleX = wCanvas / newImg.width;
    newImg.scaleY = hCanvas / newImg.height;

    canvas.remove(img);
    canvas.remove(rect);
    canvas.add(newImg);
    canvas.setActiveObject(newImg);
    canvas.requestRenderAll();

    bar.remove();
    document.removeEventListener('keydown', onCropKey);
    cropState = null;

    if (typeof saveState === 'function') saveState();
    if (typeof renderPropsPanel === 'function') renderPropsPanel(newImg);
    if (typeof renderLayersPanel === 'function') renderLayersPanel();
    status(`Recortado: ${Math.round(off.width)}×${Math.round(off.height)}`);
  });
}

window.startImageCrop = startCrop;

})();
