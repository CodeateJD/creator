/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — utils.js
   Helpers: DOM query, status, color/hex, HTML escape
   ═══════════════════════════════════════════════════════════════ */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => root.querySelectorAll(sel);

function status(msg) {
  const el = $('#statusRight');
  if (el) el.textContent = msg;
}

function toHex(c) {
  if (!c || typeof c !== 'string') return '#000000';
  if (c.startsWith('#')) {
    if (c.length === 7) return c.toLowerCase();
    if (c.length === 4) return '#' + c[1]+c[1]+c[2]+c[2]+c[3]+c[3];
  }
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) return '#' + [m[1],m[2],m[3]].map(n => parseInt(n).toString(16).padStart(2,'0')).join('');
  return '#000000';
}

function esc(s) {
  return String(s || '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

// Fuerza a Fabric a re-medir el texto cuando cambian props que afectan su tamano
// (fontFamily, fontWeight, fontStyle). Espera a document.fonts.load para evitar
// que el bounding box quede con metricas del fallback cuando la webfont aun no carga.
function reflowText(obj) {
  if (!obj || typeof obj.initDimensions !== 'function') return;
  const apply = () => {
    try {
      obj.initDimensions();
      if (typeof obj.setCoords === 'function') obj.setCoords();
    } catch (_) {}
    if (typeof canvas !== 'undefined') canvas.requestRenderAll();
  };
  if (document.fonts && document.fonts.load && obj.fontFamily) {
    const weight = obj.fontWeight || 400;
    const style  = obj.fontStyle === 'italic' ? 'italic' : 'normal';
    document.fonts.load(`${style} ${weight} 16px "${obj.fontFamily}"`).then(apply).catch(apply);
  } else {
    apply();
  }
}
