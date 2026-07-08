/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — tools-menu.js
   Submenú "Tools" + lápiz libre, gotero, quitar fondo IA, filtros
   ═══════════════════════════════════════════════════════════════ */

(function() {
'use strict';

const toolMenuBtn = document.getElementById('toolMenuBtn');
const toolSubmenu = document.getElementById('toolMenuSubmenu');

if (!toolMenuBtn || !toolSubmenu) return;

// ─────────────────────────── Submenu open/close ───────────────────────────
function positionSubmenu() {
  const rect = toolMenuBtn.getBoundingClientRect();
  toolSubmenu.style.left = (rect.right + 6) + 'px';
  toolSubmenu.style.top = rect.top + 'px';
}

toolMenuBtn.addEventListener('click', e => {
  e.stopPropagation();
  const willOpen = !toolSubmenu.classList.contains('open');
  if (willOpen) positionSubmenu();
  toolSubmenu.classList.toggle('open');
});
document.addEventListener('click', e => {
  if (!toolSubmenu.contains(e.target) && e.target !== toolMenuBtn && !toolMenuBtn.contains(e.target)) {
    toolSubmenu.classList.remove('open');
  }
});
window.addEventListener('resize', () => {
  if (toolSubmenu.classList.contains('open')) positionSubmenu();
});
window.addEventListener('scroll', () => {
  if (toolSubmenu.classList.contains('open')) positionSubmenu();
}, true);

// Submenu item click routing
toolSubmenu.querySelectorAll('[data-subtool]').forEach(item => {
  item.addEventListener('click', () => {
    const sub = item.dataset.subtool;
    toolSubmenu.classList.remove('open');
    handleSubtool(sub);
  });
});

function handleSubtool(sub) {
  if (sub === 'shape')    return setTool('shape');
  if (sub === 'icon')     return setTool('icon');
  if (sub === 'draw')     return enableDrawTool();
  if (sub === 'eyedrop')  return pickColorWithEyedropper();
  if (sub === 'fill')     return enableFillTool();
  if (sub === 'bgauto')   return removeBackgroundAuto();
  if (sub === 'bgremove') return removeBackgroundSelected();
  if (sub === 'colorremove') return enableColorRemoveTool();
  if (sub === 'eraser')   return (typeof enableEraserTool === 'function') && enableEraserTool();
  if (sub === 'wand')     return (typeof enableWandTool === 'function') && enableWandTool();
  if (sub === 'lasso')    return (typeof enableLassoTool === 'function') && enableLassoTool();
  if (sub === 'filters')  return openFiltersForSelected();
}

// ═══════════════════════════ LÁPIZ LIBRE (BRUSH) ═══════════════════════════
function enableDrawTool() {
  state.tool = 'draw';
  if (!state.brush) {
    state.brush = { color: '#0f172a', width: 4, type: 'pencil' };
  }
  applyBrushSettings();
  canvas.isDrawingMode = true;
  canvas.selection = false;
  canvas.defaultCursor = 'crosshair';

  // Mark active
  $$('.tool').forEach(t => t.classList.remove('active'));

  status('Lápiz libre — dibuja sobre el lienzo');
  renderBrushPanel();
}

function applyBrushSettings() {
  const b = state.brush;
  let brush;
  if (b.type === 'spray') {
    brush = new fabric.SprayBrush(canvas);
    brush.density = 20;
    brush.dotWidth = 1;
  } else if (b.type === 'marker') {
    brush = new fabric.PencilBrush(canvas);
  } else {
    brush = new fabric.PencilBrush(canvas);
  }
  brush.color = b.type === 'marker' ? hexToRgba(b.color, 0.5) : b.color;
  brush.width = b.width;
  canvas.freeDrawingBrush = brush;
}

function hexToRgba(hex, alpha) {
  const m = hex.replace('#', '');
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function renderBrushPanel() {
  const container = document.getElementById('panelProps');
  if (!container) return;
  const b = state.brush;
  container.innerHTML = `
    <div class="prop-section">
      <div class="prop-section-title">Lápiz libre</div>
      <p class="pub-hint" style="margin:6px 0 14px">Dibuja directo sobre el lienzo. Cada trazo queda como objeto editable. Presiona <b>Esc</b> o selecciona otra herramienta para salir.</p>

      <div class="prop-field">
        <label>Tipo</label>
        <div class="toggle-group">
          <button class="toggle-btn ${b.type === 'pencil' ? 'active' : ''}" data-brush-type="pencil">Lápiz</button>
          <button class="toggle-btn ${b.type === 'marker' ? 'active' : ''}" data-brush-type="marker">Marcador</button>
          <button class="toggle-btn ${b.type === 'spray' ? 'active' : ''}" data-brush-type="spray">Spray</button>
        </div>
      </div>

      <div class="prop-field">
        <label>Color</label>
        <div style="display:flex;gap:6px;align-items:center">
          <input type="color" id="brushColor" value="${b.color}" style="width:44px;height:36px;border:1px solid var(--border-strong);border-radius:6px;background:transparent;cursor:pointer">
          <input type="text" class="prop-input" id="brushColorHex" value="${b.color}" style="flex:1;font-family:'JetBrains Mono',monospace">
          <button class="eyedrop-btn" id="brushEyedrop" title="Tomar color (gotero)">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22l1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="M15 6l3.4-3.4a2.12 2.12 0 1 1 3 3L18 9l.4.4a2.12 2.12 0 0 1 0 3 2.12 2.12 0 0 1-3 0l-9.8-9.8a2.12 2.12 0 0 1 0-3 2.12 2.12 0 0 1 3 0l.4.4L12 3z"/></svg>
          </button>
        </div>
      </div>

      <div class="prop-field">
        <label>Grosor <span class="range-val" id="brushWidthVal">${b.width}px</span></label>
        <input type="range" class="prop-range" id="brushWidth" min="1" max="50" step="1" value="${b.width}">
      </div>
    </div>
  `;

  // Events
  const onTypeClick = e => {
    const btn = e.target.closest('[data-brush-type]');
    if (!btn) return;
    container.querySelectorAll('[data-brush-type]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.brush.type = btn.dataset.brushType;
    applyBrushSettings();
  };
  container.querySelectorAll('[data-brush-type]').forEach(b => b.addEventListener('click', onTypeClick));

  const colorEl = document.getElementById('brushColor');
  const hexEl = document.getElementById('brushColorHex');
  colorEl.addEventListener('input', () => {
    state.brush.color = colorEl.value;
    hexEl.value = colorEl.value;
    applyBrushSettings();
  });
  hexEl.addEventListener('input', () => {
    if (/^#[0-9a-f]{6}$/i.test(hexEl.value)) {
      state.brush.color = hexEl.value;
      colorEl.value = hexEl.value;
      applyBrushSettings();
    }
  });
  document.getElementById('brushEyedrop').addEventListener('click', async () => {
    const c = await pickColorWithEyedropper(true);
    if (c) {
      state.brush.color = c;
      colorEl.value = c;
      hexEl.value = c;
      applyBrushSettings();
    }
  });

  const widthEl = document.getElementById('brushWidth');
  const widthOut = document.getElementById('brushWidthVal');
  widthEl.addEventListener('input', () => {
    state.brush.width = parseInt(widthEl.value);
    widthOut.textContent = widthEl.value + 'px';
    applyBrushSettings();
  });
}

// Exit drawing mode when switching tools
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && canvas.isDrawingMode) {
    canvas.isDrawingMode = false;
    setTool('select');
  }
  if (e.key === 'b' || e.key === 'B') {
    const ae = document.activeElement;
    if (!ae || !['INPUT','TEXTAREA'].includes(ae.tagName)) {
      enableDrawTool();
    }
  }
  if (e.key === 'g' || e.key === 'G') {
    const ae = document.activeElement;
    if (!ae || !['INPUT','TEXTAREA'].includes(ae.tagName)) {
      pickColorWithEyedropper();
    }
  }
});

// Hook into setTool to auto-exit drawing mode when changing tool
const originalSetTool = window.setTool;
if (typeof originalSetTool === 'function') {
  window.setTool = function(tool) {
    if (canvas.isDrawingMode && tool !== 'draw') {
      canvas.isDrawingMode = false;
    }
    return originalSetTool(tool);
  };
}

// ═══════════════════════════ RELLENO (FILL) ═══════════════════════════
let fillActive = false;

function enableFillTool() {
  if (fillActive) return disableFillTool();
  // Ensure no other mode is blocking clicks
  if (canvas.isDrawingMode) canvas.isDrawingMode = false;
  canvas.discardActiveObject();

  fillActive = true;
  canvas.selection = false;
  canvas.defaultCursor = 'crosshair';
  canvas.hoverCursor = 'crosshair';
  document.body.classList.add('fill-mode');

  // Make all non-image objects keep receiving events
  canvas.getObjects().forEach(o => { o.evented = true; });

  try { if (typeof status === 'function') status('Relleno ACTIVO — clic sobre forma o fondo (Esc = salir)'); } catch (_) {}

  // Register fresh listener (remove any duplicate first)
  canvas.off('mouse:down', onFillClick);
  canvas.on('mouse:down', onFillClick);
  document.addEventListener('keydown', onFillKey);

  canvas.requestRenderAll();
}

function disableFillTool() {
  fillActive = false;
  canvas.off('mouse:down', onFillClick);
  document.removeEventListener('keydown', onFillKey);
  canvas.defaultCursor = 'default';
  canvas.hoverCursor = 'move';
  canvas.selection = true;
  document.body.classList.remove('fill-mode');
  try { if (typeof status === 'function') status('Relleno desactivado'); } catch (_) {}
}

function onFillKey(e) {
  if (e.key === 'Escape') disableFillTool();
}

function onFillClick(opt) {
  if (!fillActive) return;
  const color = state.activeColor || '#667eea';
  const target = opt.target;

  if (target) {
    if (target.type === 'image') {
      const p = canvas.getPointer(opt.e);
      floodFillImage(target, color, p.x, p.y);
      return;
    }
    if (target.fill !== undefined) {
      target.set('fill', color);
      canvas.requestRenderAll();
      if (typeof renderPropsPanel === 'function') renderPropsPanel(target);
      if (typeof saveState === 'function') saveState();
      if (typeof status === 'function') status(`✓ Rellenado con ${color}`);
    }
  } else {
    if (typeof setCanvasBgColor === 'function') {
      setCanvasBgColor(color);
      if (typeof status === 'function') status(`✓ Fondo ${color}`);
    }
  }
}

function hexToRgb(hex) {
  const m = hex.replace('#','');
  return [parseInt(m.substring(0,2),16), parseInt(m.substring(2,4),16), parseInt(m.substring(4,6),16)];
}

function floodFillImage(img, color, canvasX, canvasY) {
  const el = img._element || img.getElement();
  if (!el) return;

  // Point in image natural pixel coords (ignoring rotation for V1)
  const ib = img.getBoundingRect(true, true);
  const px = Math.floor((canvasX - ib.left) / (img.scaleX || 1));
  const py = Math.floor((canvasY - ib.top) / (img.scaleY || 1));

  const w = el.naturalWidth || el.width;
  const h = el.naturalHeight || el.height;

  if (px < 0 || py < 0 || px >= w || py >= h) {
    if (typeof status === 'function') status('Fuera de la imagen');
    return;
  }

  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const ctx = off.getContext('2d');
  try {
    ctx.drawImage(el, 0, 0);
  } catch (err) {
    if (typeof status === 'function') status('Error: imagen con CORS bloqueado');
    return;
  }

  let imgData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch (err) {
    if (typeof status === 'function') status('Error: imagen externa sin CORS');
    return;
  }
  const data = imgData.data;

  const startIdx = (py * w + px) * 4;
  const sR = data[startIdx], sG = data[startIdx+1], sB = data[startIdx+2], sA = data[startIdx+3];
  const [tR, tG, tB] = hexToRgb(color);
  const startIsTransparent = sA < 128;

  // If same color already, no-op
  if (sR === tR && sG === tG && sB === tB && sA === 255) {
    if (typeof status === 'function') status('Ya tiene ese color');
    return;
  }

  const tol = 32;
  const tolSq = tol * tol * 3;
  const visited = new Uint8Array(w * h);
  const stack = [px, py];

  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = y * w + x;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const di = idx * 4;
    const a = data[di + 3];

    // Transparent → match any transparent pixel
    // Opaque → match RGB within tolerance (and also opaque)
    if (startIsTransparent) {
      if (a >= 128) continue;
    } else {
      if (a < 128) continue;
      const dr = data[di] - sR;
      const dg = data[di+1] - sG;
      const db = data[di+2] - sB;
      if (dr*dr + dg*dg + db*db > tolSq) continue;
    }

    data[di]   = tR;
    data[di+1] = tG;
    data[di+2] = tB;
    data[di+3] = 255;

    stack.push(x+1, y);
    stack.push(x-1, y);
    stack.push(x, y+1);
    stack.push(x, y-1);
  }

  ctx.putImageData(imgData, 0, 0);

  const dataUrl = off.toDataURL('image/png');

  // Use setSrc to modify the existing Fabric image in place (single history step)
  img.setSrc(dataUrl, () => {
    canvas.requestRenderAll();
    if (typeof saveState === 'function') saveState();
    if (typeof status === 'function') status(`✓ Área rellenada con ${color}`);
  });
}

// Shortcuts: F fill, E eraser, W wand, L lasso
document.addEventListener('keydown', e => {
  const ae = document.activeElement;
  if (ae && ['INPUT','TEXTAREA'].includes(ae.tagName)) return;
  const k = e.key.toLowerCase();
  if (k === 'f') enableFillTool();
  else if (k === 'e' && typeof enableEraserTool === 'function') enableEraserTool();
  else if (k === 'w' && typeof enableWandTool === 'function') enableWandTool();
  else if (k === 'l' && typeof enableLassoTool === 'function') enableLassoTool();
});

// ═══════════════════════════ QUITAR FONDO AUTO (detecta logo vs foto) ═══════════════════════════
async function removeBackgroundAuto() {
  const active = canvas.getActiveObject();
  if (!active || active.type !== 'image') {
    alert('Selecciona primero una imagen');
    return;
  }
  if (!isPro()) {
    if (typeof showUpgradeModal === 'function') showUpgradeModal('quitar-fondo');
    else alert('Feature Pro');
    return;
  }

  const loader = showBgLoader('Analizando imagen...');
  try {
    const analysis = analyzeImage(active);
    loader.querySelector('#bgLoaderMsg').textContent = `Tipo detectado: ${analysis.type}. Procesando...`;
    await new Promise(r => setTimeout(r, 400)); // let user read

    if (analysis.type === 'logo' || analysis.type === 'graphic') {
      // Use color-remove with detected bg color
      removeColorFromImageByRGB(active, analysis.bgColor);
      loader.remove();
    } else {
      // Use AI model
      loader.querySelector('#bgLoaderMsg').textContent = 'Procesando con IA...';
      const mod = await loadBgRemoval();
      const src = active.getSrc ? active.getSrc() : active._element.src;
      const srcBlob = await fetch(src).then(r => r.blob());
      const resultBlob = await mod.removeBackground(srcBlob, {
        publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.5.5/dist/',
        model: 'isnet',
      });
      const url = URL.createObjectURL(resultBlob);

      const prevDisplayW = (active.width || 0) * (active.scaleX || 1);
      const prevDisplayH = (active.height || 0) * (active.scaleY || 1);

      active.setSrc(url, () => {
        if (active.width && active.height) {
          active.scaleX = prevDisplayW / active.width;
          active.scaleY = prevDisplayH / active.height;
        }
        canvas.requestRenderAll();
        if (typeof saveState === 'function') saveState();
        loader.remove();
        status(`✓ Fondo removido (IA)`);
      }, { crossOrigin: 'anonymous' });
    }
  } catch (err) {
    console.error(err);
    loader.remove();
    alert('Error: ' + err.message);
  }
}

function analyzeImage(img) {
  const el = img._element || img.getElement();
  const w = el.naturalWidth || el.width;
  const h = el.naturalHeight || el.height;

  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const ctx = off.getContext('2d');
  ctx.drawImage(el, 0, 0);

  let imgData;
  try { imgData = ctx.getImageData(0, 0, w, h); }
  catch (e) { return { type: 'photo' }; }

  const data = imgData.data;

  // Sample corner + edge pixels
  const samplePoints = [
    [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
    [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 1],
    [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)],
    [5, 5], [w - 6, 5], [5, h - 6], [w - 6, h - 6],
  ];
  const cornerColors = samplePoints.map(([x, y]) => {
    const i = (y * w + x) * 4;
    return [data[i], data[i + 1], data[i + 2], data[i + 3]];
  });

  // Check border homogeneity (logos have uniform borders)
  const ref = cornerColors[0];
  const totalDiff = cornerColors.slice(1).reduce((sum, c) =>
    sum + Math.abs(c[0] - ref[0]) + Math.abs(c[1] - ref[1]) + Math.abs(c[2] - ref[2]), 0);
  const avgDiff = totalDiff / (cornerColors.length - 1);

  // Count unique colors with coarse bucketing (32 levels per channel = 32768 buckets)
  const buckets = new Set();
  const stride = Math.max(1, Math.floor((w * h) / 5000));
  for (let i = 0; i < data.length; i += 4 * stride) {
    const r = data[i] >> 3;
    const g = data[i + 1] >> 3;
    const b = data[i + 2] >> 3;
    buckets.add(r * 1024 + g * 32 + b);
  }

  // Logo heuristics: uniform borders AND few colors
  if (avgDiff < 20 && buckets.size < 800) {
    return { type: 'logo', bgColor: [ref[0], ref[1], ref[2]] };
  }
  if (avgDiff < 30 && buckets.size < 300) {
    return { type: 'graphic', bgColor: [ref[0], ref[1], ref[2]] };
  }

  return { type: 'photo' };
}

function removeColorFromImageByRGB(img, rgb) {
  const el = img._element || img.getElement();
  const w = el.naturalWidth || el.width;
  const h = el.naturalHeight || el.height;

  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const ctx = off.getContext('2d');
  ctx.drawImage(el, 0, 0);

  let imgData;
  try { imgData = ctx.getImageData(0, 0, w, h); }
  catch (e) { status('CORS error'); return; }

  const data = imgData.data;
  const [sR, sG, sB] = rgb;
  const tol = 60;
  const tolSq = tol * tol * 3;
  const feather = tol * 1.5;

  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - sR;
    const dg = data[i + 1] - sG;
    const db = data[i + 2] - sB;
    const distSq = dr * dr + dg * dg + db * db;
    if (distSq <= tolSq) {
      data[i + 3] = 0;
      count++;
    } else if (distSq < feather * feather * 3) {
      const t = (Math.sqrt(distSq) - tol) / (feather - tol);
      data[i + 3] = Math.max(0, Math.min(255, Math.round(data[i + 3] * t)));
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const dataUrl = off.toDataURL('image/png');
  img.setSrc(dataUrl, () => {
    canvas.requestRenderAll();
    if (typeof saveState === 'function') saveState();
    status(`✓ Fondo de logo removido (${count.toLocaleString()} píxeles)`);
  });
}

// ═══════════════════════════ QUITAR COLOR DE FONDO (remove-color) ═══════════════════════════
let colorRemoveActive = false;

function enableColorRemoveTool() {
  const active = canvas.getActiveObject();
  if (!active || active.type !== 'image') {
    alert('Selecciona primero una imagen');
    return;
  }
  if (colorRemoveActive) return disableColorRemoveTool();
  colorRemoveActive = true;
  canvas.selection = false;
  canvas.defaultCursor = 'crosshair';
  canvas.hoverCursor = 'crosshair';
  document.body.classList.add('fill-mode');
  if (typeof status === 'function') status('Quitar color — clic sobre el color a eliminar (Esc cancela)');

  canvas.off('mouse:down', onColorRemoveClick);
  canvas.on('mouse:down', onColorRemoveClick);
  document.addEventListener('keydown', onColorRemoveKey);
}

function disableColorRemoveTool() {
  colorRemoveActive = false;
  canvas.off('mouse:down', onColorRemoveClick);
  document.removeEventListener('keydown', onColorRemoveKey);
  canvas.defaultCursor = 'default';
  canvas.hoverCursor = 'move';
  canvas.selection = true;
  document.body.classList.remove('fill-mode');
}

function onColorRemoveKey(e) {
  if (e.key === 'Escape') disableColorRemoveTool();
}

function onColorRemoveClick(opt) {
  if (!colorRemoveActive) return;
  const target = opt.target;
  if (!target || target.type !== 'image') {
    if (typeof status === 'function') status('Clic sobre la imagen para elegir color a quitar');
    return;
  }
  const p = canvas.getPointer(opt.e);
  removeColorFromImage(target, p.x, p.y);
  disableColorRemoveTool();
}

function removeColorFromImage(img, canvasX, canvasY) {
  const el = img._element || img.getElement();
  if (!el) return;

  const ib = img.getBoundingRect(true, true);
  const px = Math.floor((canvasX - ib.left) / (img.scaleX || 1));
  const py = Math.floor((canvasY - ib.top) / (img.scaleY || 1));
  const w = el.naturalWidth || el.width;
  const h = el.naturalHeight || el.height;
  if (px < 0 || py < 0 || px >= w || py >= h) return;

  const off = document.createElement('canvas');
  off.width = w; off.height = h;
  const ctx = off.getContext('2d');
  try { ctx.drawImage(el, 0, 0); }
  catch (err) { if (typeof status === 'function') status('Error CORS'); return; }

  let imgData;
  try { imgData = ctx.getImageData(0, 0, w, h); }
  catch (err) { if (typeof status === 'function') status('Imagen bloqueada por CORS'); return; }

  const data = imgData.data;
  const startIdx = (py * w + px) * 4;
  const sR = data[startIdx], sG = data[startIdx+1], sB = data[startIdx+2];

  const tol = 60;
  const tolSq = tol * tol * 3;
  const feather = tol * 1.5; // soft edge boundary

  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - sR;
    const dg = data[i+1] - sG;
    const db = data[i+2] - sB;
    const distSq = dr*dr + dg*dg + db*db;
    if (distSq <= tolSq) {
      data[i+3] = 0;
      count++;
    } else if (distSq < feather * feather * 3) {
      // Soft feather for anti-aliased edges
      const t = (Math.sqrt(distSq) - tol) / (feather - tol);
      data[i+3] = Math.max(0, Math.min(255, Math.round(data[i+3] * t)));
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const dataUrl = off.toDataURL('image/png');
  img.setSrc(dataUrl, () => {
    canvas.requestRenderAll();
    if (typeof saveState === 'function') saveState();
    if (typeof status === 'function') status(`✓ ${count.toLocaleString()} píxeles removidos`);
  });
}

// ═══════════════════════════ GOTERO (EYEDROPPER) ═══════════════════════════
async function pickColorWithEyedropper(returnOnly) {
  // 1) Try native EyeDropper API (Chrome/Edge on secure context)
  if (window.EyeDropper) {
    try {
      const ed = new EyeDropper();
      const res = await ed.open();
      return applyPickedColor(res.sRGBHex, returnOnly);
    } catch (err) {
      // User cancelled — fall through to canvas fallback only if it's a real failure
      if (err && err.name === 'AbortError') return null;
      console.warn('EyeDropper API failed, using canvas fallback', err);
    }
  }
  // 2) Fallback: canvas pick mode
  return pickColorFromCanvas(returnOnly);
}

function applyPickedColor(hex, returnOnly) {
  try { if (typeof status === 'function') status(`Color: ${hex} (copiado)`); } catch (_) {}
  try { navigator.clipboard && navigator.clipboard.writeText(hex); } catch (_) {}

  // Update active color globally (swatch in topbar + history)
  if (typeof setActiveColor === 'function') setActiveColor(hex);

  if (returnOnly) return hex;

  const active = canvas.getActiveObject();
  let appliedTo = null;

  if (active) {
    if (active.type === 'i-text' || active.type === 'textbox' || active.type === 'text') {
      active.set('fill', hex);
      appliedTo = 'texto';
    } else if (active.fill !== undefined) {
      active.set('fill', hex);
      appliedTo = 'objeto';
    }
    canvas.requestRenderAll();
    if (typeof renderPropsPanel === 'function') renderPropsPanel(active);
  }

  showColorToast(hex, appliedTo);
  return hex;
}

function showColorToast(hex, appliedTo) {
  // Remove any existing toast
  const existing = document.getElementById('studioColorToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'studioColorToast';
  toast.innerHTML = `
    <div class="ct-swatch" style="background:${hex}"></div>
    <div class="ct-info">
      <div class="ct-hex">${hex.toUpperCase()}</div>
      <div class="ct-msg">${appliedTo ? `Aplicado a ${appliedTo}` : 'Copiado al portapapeles'}</div>
    </div>
    <div class="ct-actions">
      <button class="ct-btn" data-ct="bg">Usar como fondo</button>
      <button class="ct-btn" data-ct="text">Nuevo texto</button>
      <button class="ct-btn ct-close" data-ct="close" aria-label="Cerrar">×</button>
    </div>
  `;
  document.body.appendChild(toast);

  // Styles (injected once)
  if (!document.getElementById('studioColorToastStyle')) {
    const s = document.createElement('style');
    s.id = 'studioColorToastStyle';
    s.textContent = `
      #studioColorToast {
        position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
        background: var(--bg-1); border: 1px solid var(--border-strong);
        border-radius: 12px; box-shadow: var(--shadow-lg);
        padding: 12px 14px; display: flex; align-items: center; gap: 12px;
        z-index: 10001; min-width: 320px; max-width: 440px;
        animation: ctIn 0.2s ease;
      }
      @keyframes ctIn {
        from { opacity: 0; transform: translate(-50%, 10px); }
        to   { opacity: 1; transform: translate(-50%, 0); }
      }
      #studioColorToast .ct-swatch {
        width: 42px; height: 42px; border-radius: 8px;
        border: 2px solid rgba(255,255,255,0.1);
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.3);
        flex-shrink: 0;
      }
      #studioColorToast .ct-info { flex: 1; min-width: 0; }
      #studioColorToast .ct-hex {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px; font-weight: 800; color: var(--text-1);
      }
      #studioColorToast .ct-msg {
        font-size: 11px; color: var(--text-3); margin-top: 2px;
      }
      #studioColorToast .ct-actions { display: flex; gap: 4px; align-items: center; }
      #studioColorToast .ct-btn {
        padding: 6px 10px; border-radius: 6px;
        border: 1px solid var(--border-strong);
        background: var(--bg-3); color: var(--text-1);
        font-size: 11px; font-weight: 600; font-family: inherit;
        cursor: pointer; transition: all var(--t-fast);
      }
      #studioColorToast .ct-btn:hover {
        border-color: var(--accent); color: var(--accent);
      }
      #studioColorToast .ct-close {
        padding: 4px 8px; font-size: 16px; line-height: 1;
      }
    `;
    document.head.appendChild(s);
  }

  toast.addEventListener('click', e => {
    const act = e.target.dataset && e.target.dataset.ct;
    if (!act) return;
    if (act === 'close') {
      toast.remove();
    } else if (act === 'bg') {
      if (typeof setCanvasBgColor === 'function') {
        setCanvasBgColor(hex);
        if (typeof status === 'function') status(`Fondo: ${hex}`);
      }
      toast.remove();
    } else if (act === 'text') {
      if (typeof addTextAt === 'function') {
        const t = addTextAt(canvas.getWidth() / 2, canvas.getHeight() / 2, 'Texto');
        if (t) t.set('fill', hex);
        canvas.requestRenderAll();
      }
      toast.remove();
    }
  });

  // Auto-dismiss after 8s
  setTimeout(() => {
    if (document.getElementById('studioColorToast') === toast) toast.remove();
  }, 8000);
}

function pickColorFromCanvas(returnOnly) {
  return new Promise(resolve => {
    const canvasEl = canvas.upperCanvasEl || canvas.lowerCanvasEl || canvas.getElement();
    const originalCursor = canvas.defaultCursor;
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';
    canvasEl.style.cursor = 'crosshair';

    try { if (typeof status === 'function') status('Haz clic en un color del lienzo...'); } catch (_) {}

    const handler = (opt) => {
      const p = canvas.getPointer(opt.e);
      const ctx = canvas.getContext('2d') || canvas.lowerCanvasEl.getContext('2d');
      try {
        const pixel = canvas.lowerCanvasEl.getContext('2d').getImageData(
          Math.floor(p.x * canvas.getZoom()),
          Math.floor(p.y * canvas.getZoom()),
          1, 1
        ).data;
        const hex = '#' + [pixel[0], pixel[1], pixel[2]]
          .map(n => n.toString(16).padStart(2, '0')).join('');

        canvas.off('mouse:down', handler);
        canvas.defaultCursor = originalCursor;
        canvas.hoverCursor = 'move';
        canvasEl.style.cursor = '';

        resolve(applyPickedColor(hex, returnOnly));
      } catch (err) {
        console.error('Canvas pick failed', err);
        canvas.off('mouse:down', handler);
        canvas.defaultCursor = originalCursor;
        canvasEl.style.cursor = '';
        resolve(null);
      }
    };

    canvas.on('mouse:down', handler);

    // Allow ESC to cancel
    const esc = e => {
      if (e.key === 'Escape') {
        canvas.off('mouse:down', handler);
        canvas.defaultCursor = originalCursor;
        canvasEl.style.cursor = '';
        document.removeEventListener('keydown', esc);
        resolve(null);
      }
    };
    document.addEventListener('keydown', esc);
  });
}

// ═══════════════════════════ QUITAR FONDO IA ═══════════════════════════
let bgRemovalModule = null;
async function loadBgRemoval() {
  if (bgRemovalModule) return bgRemovalModule;
  const overlay = showBgLoader('Cargando modelo de IA (primera vez ~30s)...');
  try {
    bgRemovalModule = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');
  } finally {
    overlay.remove();
  }
  return bgRemovalModule;
}

function showBgLoader(msg) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;
    background:rgba(5,8,16,0.8);backdrop-filter:blur(4px);
  `;
  overlay.innerHTML = `
    <div style="background:var(--bg-1);border:1px solid var(--border-strong);border-radius:14px;padding:24px 32px;text-align:center;max-width:360px">
      <div class="bg-spinner" style="width:42px;height:42px;margin:0 auto 14px;border:3px solid var(--bg-3);border-top-color:var(--accent);border-radius:50%;animation:bgspin 0.8s linear infinite"></div>
      <div style="color:var(--text-1);font-size:13px;font-weight:600" id="bgLoaderMsg">${msg}</div>
    </div>
  `;
  if (!document.getElementById('bgSpinnerStyle')) {
    const s = document.createElement('style');
    s.id = 'bgSpinnerStyle';
    s.textContent = '@keyframes bgspin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
  document.body.appendChild(overlay);
  return overlay;
}

async function removeBackgroundSelected() {
  const active = canvas.getActiveObject();
  if (!active || active.type !== 'image') {
    alert('Selecciona primero una imagen del lienzo');
    return;
  }
  if (!isPro()) {
    if (typeof showUpgradeModal === 'function') {
      showUpgradeModal('quitar-fondo');
    } else {
      alert('Quitar fondo es una feature Pro');
    }
    return;
  }

  const loader = showBgLoader('Procesando con IA...');
  try {
    const mod = await loadBgRemoval();
    loader.querySelector('#bgLoaderMsg').textContent = 'Quitando fondo...';

    // Get source as blob
    const src = active.getSrc ? active.getSrc() : active._element.src;
    const srcBlob = await fetch(src).then(r => r.blob());
    const resultBlob = await mod.removeBackground(srcBlob, {
      publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.5.5/dist/',
      model: 'isnet',
    });
    const url = URL.createObjectURL(resultBlob);

    // Preserve displayed size by adjusting scale after setSrc
    const prevDisplayW = (active.width || 0) * (active.scaleX || 1);
    const prevDisplayH = (active.height || 0) * (active.scaleY || 1);

    active.setSrc(url, () => {
      if (active.width && active.height) {
        active.scaleX = prevDisplayW / active.width;
        active.scaleY = prevDisplayH / active.height;
      }
      canvas.requestRenderAll();
      if (typeof saveState === 'function') saveState();
      loader.remove();
      status('Fondo removido');
    }, { crossOrigin: 'anonymous' });
  } catch (err) {
    console.error(err);
    loader.remove();
    alert('Error al quitar el fondo: ' + err.message);
  }
}

// ═══════════════════════════ FILTROS (open panel) ═══════════════════════════
function openFiltersForSelected() {
  const active = canvas.getActiveObject();
  if (!active || active.type !== 'image') {
    alert('Selecciona primero una imagen para aplicar filtros');
    return;
  }
  // renderPropsPanel shows filters automatically for images
  if (typeof renderPropsPanel === 'function') {
    renderPropsPanel(active);
  }
  // Scroll panel into view / focus
  const panel = document.getElementById('panelProps');
  if (panel) panel.scrollTop = 0;
  status('Filtros disponibles en el panel derecho');
}

})();
