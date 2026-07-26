/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — active-color.js
   3 slots de color activo en topbar. Free: solo edita slot 0.
   Pro: edita los 3. Click → activar. Doble clic → editar.
   ═══════════════════════════════════════════════════════════════ */

(function() {
'use strict';

const STORAGE_KEY_COLORS = 'codeateJD_studio_activeColors';
const STORAGE_KEY_SLOT   = 'codeateJD_studio_activeColorSlot';
const STORAGE_KEY_HIST   = 'codeateJD_studio_colorHistory';

const wrap = document.getElementById('activeColorWrap');
if (!wrap) return;
const swatches = wrap.querySelectorAll('.active-color-swatch');
if (!swatches.length) return;

// Load persisted state
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_COLORS) || 'null');
  if (Array.isArray(saved) && saved.length === 3) state.activeColors = saved;
  const slot = parseInt(localStorage.getItem(STORAGE_KEY_SLOT) || '0');
  if (!isNaN(slot) && slot >= 0 && slot < 3) state.activeColorSlot = slot;
  const hist = JSON.parse(localStorage.getItem(STORAGE_KEY_HIST) || '[]');
  if (Array.isArray(hist)) state.colorHistory = hist.slice(0, 8);
} catch (_) {}

state.activeColor = state.activeColors[state.activeColorSlot];

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY_COLORS, JSON.stringify(state.activeColors));
    localStorage.setItem(STORAGE_KEY_SLOT, String(state.activeColorSlot));
    localStorage.setItem(STORAGE_KEY_HIST, JSON.stringify(state.colorHistory));
  } catch (_) {}
}

function refreshSwatches() {
  swatches.forEach((sw, i) => {
    sw.style.background = state.activeColors[i];
    sw.classList.toggle('active', i === state.activeColorSlot);
    const locked = i > 0 && !isPro();
    sw.classList.toggle('locked', locked);
  });
}
refreshSwatches();

function selectSlot(slot) {
  state.activeColorSlot = slot;
  state.activeColor = state.activeColors[slot];
  persist();
  refreshSwatches();
}

// Click: select slot as active
swatches.forEach((sw, i) => {
  let lastClick = 0;
  sw.addEventListener('click', e => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastClick < 300) {
      // double click → edit
      openEditPopover(i);
    } else {
      selectSlot(i);
    }
    lastClick = now;
  });
});

// ─────────────────── Public API ───────────────────
function setActiveColor(hex, applyToSelected) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return;
  hex = hex.toLowerCase();
  const slot = state.activeColorSlot;
  // Free: only slot 0 can be written via setActiveColor (from gotero etc.)
  if (slot > 0 && !isPro()) {
    // Force change into slot 0
    state.activeColorSlot = 0;
  }
  state.activeColors[state.activeColorSlot] = hex;
  state.activeColor = hex;

  state.colorHistory = state.colorHistory.filter(c => c !== hex);
  state.colorHistory.unshift(hex);
  if (state.colorHistory.length > 8) state.colorHistory.length = 8;

  persist();
  refreshSwatches();

  if (applyToSelected) applyColorToSelected(hex);
}

function applyColorToSelected(hex) {
  const active = canvas.getActiveObject();
  if (!active) return false;
  const color = hex || state.activeColor;
  if (active.type === 'i-text' || active.type === 'textbox' || active.type === 'text') {
    active.set('fill', color);
  } else if (active.fill !== undefined) {
    active.set('fill', color);
  }
  canvas.requestRenderAll();
  if (typeof renderPropsPanel === 'function') renderPropsPanel(active);
  if (typeof saveState === 'function') saveState();
  return true;
}

window.setActiveColor = setActiveColor;
window.applyColorToSelected = applyColorToSelected;
window.refreshActiveColors = refreshSwatches;

function updateProUI() {
  document.body.classList.toggle('is-pro', isPro());
  refreshSwatches();
  // Re-evalúa los locks de formato: al pasar a Pro quita la píldora "PRO" (.fmt-lock)
  // y el atenuado (.locked) de Story/LinkedIn/X, que si no quedaban pegados.
  if (typeof refreshFormatLocks === 'function') refreshFormatLocks();
}
updateProUI();
window.updateProUI = updateProUI;

// Re-render UI whenever plan may have changed (poll lightweight)
let lastPlan = state.userPlan;
setInterval(() => {
  if (state.userPlan !== lastPlan) {
    lastPlan = state.userPlan;
    updateProUI();
  }
}, 500);

// ─────────────────── Popover (edit slot) ───────────────────
let popover = null;
let popoverSlot = 0;

function openEditPopover(slot) {
  closePopover();
  popoverSlot = slot;

  const locked = slot > 0 && !isPro();
  popover = document.createElement('div');
  popover.className = 'active-color-popover';
  popover.innerHTML = locked ? popoverProHTML() : popoverEditHTML(slot);
  document.body.appendChild(popover);
  positionPopover(slot);
  if (locked) bindProEvents(); else bindEditEvents(slot);

  setTimeout(() => document.addEventListener('click', onDocClick), 0);
}

function closePopover() {
  if (!popover) return;
  popover.remove();
  popover = null;
  document.removeEventListener('click', onDocClick);
}

function onDocClick(e) {
  if (!popover) return;
  if (!popover.contains(e.target) && !wrap.contains(e.target)) closePopover();
}

function positionPopover(slot) {
  const rect = swatches[slot].getBoundingClientRect();
  popover.style.top = (rect.bottom + 8) + 'px';
  const left = Math.max(10, rect.left - 100);
  popover.style.left = left + 'px';
  popover.style.right = 'auto';
}

function popoverEditHTML(slot) {
  const color = state.activeColors[slot];
  const hist = state.colorHistory.length
    ? state.colorHistory.map(c => `<button class="cp-hist-item" data-hist="${c}" style="background:${c}" title="${c.toUpperCase()}"></button>`).join('')
    : '<span class="cp-hist-empty">Sin historial aún</span>';

  return `
    <div class="cp-header">Editar Color ${slot + 1}</div>
    <div class="cp-section">
      <div class="cp-row">
        <input type="color" id="cpPicker" value="${color}" class="cp-native">
        <input type="text" id="cpHex" class="cp-hex-input" value="${color.toUpperCase()}" maxlength="7" spellcheck="false">
        <button class="cp-btn cp-eyedrop" id="cpEyedrop" title="Gotero">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22l1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="M15 6l3.4-3.4a2.12 2.12 0 1 1 3 3L18 9l.4.4a2.12 2.12 0 0 1 0 3 2.12 2.12 0 0 1-3 0l-9.8-9.8a2.12 2.12 0 0 1 0-3 2.12 2.12 0 0 1 3 0l.4.4L12 3z"/></svg>
        </button>
      </div>
    </div>

    <div class="cp-section">
      <div class="cp-label">Historial</div>
      <div class="cp-hist">${hist}</div>
    </div>

    <div class="cp-section">
      <div class="cp-label">Presets</div>
      <div class="cp-hist">
        ${['#ffffff','#0f172a','#667eea','#4ade80','#f5576c','#fbbf24','#f093fb','#22d3ee'].map(c =>
          `<button class="cp-hist-item" data-preset="${c}" style="background:${c}" title="${c.toUpperCase()}"></button>`).join('')}
      </div>
    </div>

    <div class="cp-actions">
      <button class="cp-apply" id="cpApply">Aplicar a selección</button>
      <button class="cp-apply cp-apply-bg" id="cpApplyBg">Usar como fondo</button>
    </div>
  `;
}

function popoverProHTML() {
  return `
    <div class="cp-header">Slot Pro</div>
    <div class="cp-pro">
      <div class="cp-pro-icon">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <p class="cp-pro-msg">El plan <b>Free</b> permite guardar <b>1 color</b> activo.<br>Upgrade a <b>Pro</b> para usar los 3 slots.</p>
      <button class="cp-apply cp-pro-btn" id="cpProUpgrade">Upgrade a Pro</button>
    </div>
  `;
}

function bindEditEvents(slot) {
  const pick = popover.querySelector('#cpPicker');
  const hex = popover.querySelector('#cpHex');

  const applyHex = v => {
    if (!/^#[0-9a-f]{6}$/i.test(v)) return;
    v = v.toLowerCase();
    state.activeColors[slot] = v;
    if (slot === state.activeColorSlot) state.activeColor = v;
    // Update history
    state.colorHistory = state.colorHistory.filter(c => c !== v);
    state.colorHistory.unshift(v);
    if (state.colorHistory.length > 8) state.colorHistory.length = 8;
    persist();
    refreshSwatches();
  };

  pick.addEventListener('input', () => {
    applyHex(pick.value);
    hex.value = pick.value.toUpperCase();
  });
  hex.addEventListener('input', () => {
    let v = hex.value.trim();
    if (v && v[0] !== '#') v = '#' + v;
    if (/^#[0-9a-f]{6}$/i.test(v)) {
      applyHex(v);
      pick.value = v.toLowerCase();
    }
  });

  popover.querySelector('#cpEyedrop').addEventListener('click', async () => {
    closePopover();
    if (typeof pickColorWithEyedropper === 'function') {
      const c = await pickColorWithEyedropper(true);
      if (c) {
        state.activeColors[slot] = c.toLowerCase();
        if (slot === state.activeColorSlot) state.activeColor = c.toLowerCase();
        persist();
        refreshSwatches();
      }
    }
  });

  popover.querySelectorAll('[data-hist], [data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = btn.dataset.hist || btn.dataset.preset;
      applyHex(c);
      pick.value = c;
      hex.value = c.toUpperCase();
    });
  });

  popover.querySelector('#cpApply').addEventListener('click', () => {
    selectSlot(slot);
    const ok = applyColorToSelected();
    if (!ok && typeof status === 'function') status('Selecciona primero un objeto');
  });
  popover.querySelector('#cpApplyBg').addEventListener('click', () => {
    selectSlot(slot);
    if (typeof setCanvasBgColor === 'function') {
      setCanvasBgColor(state.activeColor);
      if (typeof status === 'function') status(`Fondo: ${state.activeColor}`);
    }
  });
}

function bindProEvents() {
  popover.querySelector('#cpProUpgrade').addEventListener('click', () => {
    closePopover();
    if (typeof showUpgradeModal === 'function') showUpgradeModal('colores');
    else alert('Feature Pro');
  });
}

})();
