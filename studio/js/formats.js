/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — formats.js
   Cambio de formato, zoom, fit-to-view
   ═══════════════════════════════════════════════════════════════ */

function setFormat(fmt) {
  if (!FORMATS[fmt]) return;
  if (!isFormatAvailable(fmt)) {
    showUpgradeModal('formato');
    return;
  }
  state.format = fmt;
  const f = FORMATS[fmt];
  canvas.setDimensions({ width: f.w, height: f.h }, { backstoreOnly: true });
  $$('.format-switcher button').forEach(b => {
    b.classList.toggle('active', b.dataset.format === fmt);
  });
  fitCanvasToView();
  updateCenterStatus();
}

function refreshFormatLocks() {
  $$('.format-switcher button').forEach(b => {
    const fmt = b.dataset.format;
    const locked = !isFormatAvailable(fmt);
    b.classList.toggle('locked', locked);
    if (locked && !b.querySelector('.fmt-lock')) {
      const lock = document.createElement('span');
      lock.className = 'fmt-lock';
      lock.textContent = 'PRO';
      b.appendChild(lock);
    } else if (!locked) {
      b.querySelector('.fmt-lock')?.remove();
    }
  });
}

function fitCanvasToView() {
  const area = $('#canvasArea');
  if (!area) return;
  const padding = 48;
  const availableW = area.clientWidth - padding * 2;
  const availableH = area.clientHeight - padding * 2;
  const f = FORMATS[state.format];
  const scale = Math.min(availableW / f.w, availableH / f.h, 1);
  state.fitZoom = scale;
  applyZoom(scale);
}

function applyZoom(z) {
  state.zoom = Math.max(0.05, Math.min(8, z));
  const f = FORMATS[state.format];
  canvas.setZoom(state.zoom);
  canvas.setDimensions(
    { width: f.w * state.zoom, height: f.h * state.zoom },
    { cssOnly: false }
  );
  updateZoomLabel();
}

function zoomBy(factor) { applyZoom(state.zoom * factor); }

function updateZoomLabel() {
  $('#zoomLabel').textContent = Math.round(state.zoom * 100) + '%';
}

function updateCenterStatus() {
  const f = FORMATS[state.format];
  $('#statusCenter').textContent = `${f.label} — ${f.w} × ${f.h} px`;
}
