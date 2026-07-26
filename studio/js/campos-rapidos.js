/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — campos-rapidos.js
   Edición rápida por CAMPOS, y cada rubro con SUS campos.

   EL PORQUÉ:
   El editor manual (ir a cazar el texto en el lienzo, hacer doble clic,
   escribir) no es el producto. El producto es: cargas tu plantilla y
   cambias el PRECIO o la FOTO en dos segundos, escribiendo en un campo.

   Cada rubro trae sus propios campos desde rubros.js (su "ficha"):
     · vehículos → foto, marca, modelo, año, km, detalle, precio, estado
     · comida    → foto, producto, descripción, categoría, precio, estado
     · salud     → titular, doctor, horario, la lista de "incluye"...
   Aquí NO se inventan campos: se leen de la ficha del rubro de la plantilla
   cargada, y se muestran SOLO los que esa plantilla tiene de verdad en el
   lienzo (por meta.role). Es la Opción A acordada con Jose: los campos
   siguen la maqueta aprobada, no la parten.

   Es la interfaz de la P3 de ESPEC-MOTOR-CATALOGO.md. El motor de
   sustitución ya existía (applyVariantToCanvas lee meta.role); esto es la
   forma humana de alimentarlo a mano, un valor a la vez.
   ═══════════════════════════════════════════════════════════════ */

/* ══════════ helpers ══════════ */

function _crObjDeRole(role) {
  return canvas.getObjects().find(o => o.meta && o.meta.role === role);
}
function _crFotoImagen() {
  return canvas.getObjects().find(o => o.type === 'image' && o.meta && o.meta.role === 'foto');
}

// La ficha del rubro de la plantilla cargada.
function _crRubroActivo() {
  const id = state.currentTemplate;
  if (!id || typeof rubroDePlantilla !== 'function' || typeof getRubro !== 'function') return null;
  return getRubro(rubroDePlantilla(id));
}

// Solo dígitos: "$34.500" → "34500"
function _crDigitos(s) { return String(s == null ? '' : s).replace(/[^\d]/g, ''); }

// "34500" → "$34.500"
function _crFmtPrecio(v) {
  const d = _crDigitos(v);
  if (!d) return '';
  return '$' + d.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// El rectángulo (píldora / panel) que envuelve a un texto, para poder teñirlo.
function _crPildoraDe(txt) {
  if (!txt) return null;
  let bb; try { bb = txt.getBoundingRect(true, true); } catch (_) { return null; }
  const f = FORMATS[state.format];
  let mejor = null, mejorArea = Infinity;
  canvas.getObjects().forEach(r => {
    if (r === txt || r.type !== 'rect') return;
    let rb; try { rb = r.getBoundingRect(true, true); } catch (_) { return; }
    if (rb.width > f.w * 0.95 && rb.height > f.h * 0.9) return;      // el fondo, no
    const contiene = rb.left <= bb.left + 4 && rb.top <= bb.top + 4 &&
                     rb.left + rb.width >= bb.left + bb.width - 4 &&
                     rb.top + rb.height >= bb.top + bb.height - 4;
    if (!contiene) return;
    const area = rb.width * rb.height;
    if (area < mejorArea) { mejor = r; mejorArea = area; }
  });
  return mejor;
}

function _crColorEstado(v) {
  const k = String(v).toLowerCase();
  if (/vend/.test(k))                              return { bg: '#b91c1c', fg: '#ffffff' };
  if (/reserv/.test(k))                            return { bg: '#b45309', fg: '#ffffff' };
  if (/agot|cerrad|llen/.test(k))                  return { bg: '#7f1d1d', fg: '#fecaca' };
  if (/dispon|abiert|nuevo|llegad|oferta/.test(k)) return { bg: '#4d7c0f', fg: '#ecfccb' };
  return null;
}

/* ══════════ acciones ══════════ */

// Escribe un valor de texto en el objeto amarrado a ese role.
function _crEscribir(role, tipo, valor) {
  const obj = _crObjDeRole(role);
  if (!obj) return;
  const texto = (tipo === 'precio') ? _crFmtPrecio(valor) : valor;
  obj.set('text', texto);
  if (typeof obj.initDimensions === 'function') { try { obj.initDimensions(); } catch (_) {} }
  if (typeof ajustarTextoAlPresupuesto === 'function') ajustarTextoAlPresupuesto(obj);
  if (typeof obj.setCoords === 'function') { try { obj.setCoords(); } catch (_) {} }
  canvas.requestRenderAll();
}

// Aplica un estado desde los chips: cambia el texto de la píldora y la tiñe.
function _crAplicarEstado(role, valor) {
  const obj = _crObjDeRole(role);
  if (!obj) return;
  obj.set('text', String(valor).toUpperCase());
  if (typeof obj.initDimensions === 'function') { try { obj.initDimensions(); } catch (_) {} }
  if (typeof ajustarTextoAlPresupuesto === 'function') ajustarTextoAlPresupuesto(obj);
  const pill = _crPildoraDe(obj);
  const c = _crColorEstado(valor);
  if (pill && c) pill.set('fill', c.bg);
  if (c) obj.set('fill', c.fg);
  canvas.requestRenderAll();
  if (typeof saveState === 'function') saveState();
  const inp = document.querySelector('input[data-cr-role="' + role + '"]');
  if (inp) inp.value = valor;
}

// Cambiar la foto: si hay hueco vacío lo llena; si ya hay foto puesta, la
// reemplaza conservando el encuadre (mismo recorte, misma posición).
function cambiarFotoCampo() {
  if (typeof _huecoDeFoto === 'function' && _huecoDeFoto()) {
    if (typeof pedirFotoParaHueco === 'function') pedirFotoParaHueco();
    return;
  }
  const img = _crFotoImagen();
  if (img) { _crReemplazarFoto(img); return; }
  if (typeof uploadImage === 'function') uploadImage();
}

function _crReemplazarFoto(img) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/jpg,image/webp';
  input.onchange = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = ev => {
      img.setSrc(ev.target.result, () => {
        const clip = img.clipPath;
        const marco = clip
          ? { w: clip.width * (clip.scaleX || 1), h: clip.height * (clip.scaleY || 1), left: clip.left, top: clip.top }
          : { w: img.width * img.scaleX, h: img.height * img.scaleY, left: img.left, top: img.top };
        const esc = Math.max(marco.w / img.width, marco.h / img.height);
        img.set({
          scaleX: esc, scaleY: esc,
          left: marco.left + (marco.w - img.width * esc) / 2,
          top:  marco.top  + (marco.h - img.height * esc) / 2,
        });
        canvas.requestRenderAll();
        if (typeof saveState === 'function') saveState();
        status('Foto cambiada');
      }, { crossOrigin: 'anonymous' });
    };
    rd.readAsDataURL(file);
  };
  input.click();   // sin adjuntar al DOM — igual que uploadImage()
}

/* ══════════ logo (constante de marca, no es un campo de la ficha) ══════════

   El logo no vive en rubros.js: es una constante de marca (§3.3 de la espec).
   Casi todas las plantillas traen un "TU LOGO" de texto arriba. Este campo lo
   reemplaza por la imagen del usuario, en el mismo sitio, sin pasar por el
   hueco de la foto del producto.                                            */

function _crLogoSlot() {
  const objs = canvas.getObjects();
  const img = objs.find(o => o.type === 'image' && o.meta && o.meta.role === 'logo');
  if (img) return { obj: img, tipo: 'imagen' };
  const txt = objs.find(o =>
    (o.type === 'i-text' || o.type === 'text' || o.type === 'textbox') &&
    ((o.meta && (o.meta.role === 'logo' || o.meta.marca === 'logo')) || /tu\s*logo/i.test(o.text || '')));
  if (txt) return { obj: txt, tipo: 'texto' };
  return null;
}

function ponerLogoCampo() {
  const slot = _crLogoSlot();
  if (!slot) { status('Esta plantilla no tiene espacio de logo'); return; }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml';
  input.onchange = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = ev => _crColocarLogo(ev.target.result, slot);
    rd.readAsDataURL(file);
  };
  input.click();   // sin adjuntar al DOM — como uploadImage()
}

function _crColocarLogo(src, slot) {
  const ref = slot.obj;
  let bb; try { bb = ref.getBoundingRect(true, true); } catch (_) {
    bb = { left: ref.left, top: ref.top, width: ref.width || 120, height: ref.height || 60 };
  }
  const f = FORMATS[state.format];
  // Caja del logo: ancla en la esquina del marcador, tamaño de logo (no de
  // una línea de texto): hasta ~22% del ancho y ~10% del alto del lienzo.
  const cajaW = Math.min(f.w * 0.22, Math.max(bb.width, f.w * 0.12));
  const cajaH = f.h * 0.10;

  fabric.Image.fromURL(src, img => {
    if (!img) { status('No se pudo cargar el logo'); return; }
    const escala = Math.min(cajaW / img.width, cajaH / img.height);
    img.set({
      left: bb.left, top: bb.top,
      originX: 'left', originY: 'top',
      scaleX: escala, scaleY: escala,
      meta: { role: 'logo' },
    });
    const idx = canvas.getObjects().indexOf(ref);
    canvas.remove(ref);                 // fuera el "TU LOGO" (o el logo viejo)
    canvas.insertAt(img, idx >= 0 ? idx : canvas.getObjects().length, false);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
    if (typeof saveState === 'function') saveState();
    status('Logo puesto');
    try { _crInyectar(); } catch (_) {}   // el botón pasa a "Cambiar logo"
  }, { crossOrigin: 'anonymous' });
}

/* ══════════ pintar el panel ══════════ */

function _crInyectar() {
  const panel = document.getElementById('panelProps');
  if (!panel) return;
  const viejo = panel.querySelector('#camposRapidos');
  if (viejo) viejo.remove();

  const rubro = _crRubroActivo();
  if (!rubro || !Array.isArray(rubro.campos)) return;

  // Campos de la ficha que ESTÁN en esta plantilla (Opción A).
  const items = rubro.campos.filter(c => {
    if (c.tipo === 'imagen') {
      return !!(_crObjDeRole('foto') || _crFotoImagen() ||
                (typeof _huecoDeFoto === 'function' && _huecoDeFoto()));
    }
    return !!_crObjDeRole(c.id);
  });
  if (!items.length) return;

  const bloque = document.createElement('div');
  bloque.className = 'prop-section cr-section';
  bloque.id = 'camposRapidos';

  let html = `<div class="prop-section-title">✏️ Edición rápida</div>
    <p class="cr-hint">Cambia un dato y el diseño se actualiza al instante. Campos de <b>${esc(rubro.nombre)}</b>.</p>`;

  items.forEach(c => {
    const obj = _crObjDeRole(c.id);
    const val = obj ? (obj.text || '') : '';

    if (c.tipo === 'imagen') {
      const falta = !_crFotoImagen();
      html += `<div class="cr-field">
        <label>${esc(c.label)}</label>
        <button class="cr-foto-btn ${falta ? 'cr-falta' : ''}" data-cr-foto="1">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          ${falta ? 'Poner la foto' : 'Cambiar foto'}
        </button>
      </div>`;

    } else if (c.tipo === 'precio') {
      html += `<div class="cr-field">
        <label>${esc(c.label)}</label>
        <div class="cr-precio"><span>$</span><input type="text" inputmode="numeric" class="cr-input"
          data-cr-role="${c.id}" data-cr-tipo="precio" value="${esc(_crDigitos(val))}" placeholder="0"></div>
      </div>`;

    } else if (c.tipo === 'estado') {
      const chips = (c.opciones || []).map(op =>
        `<button class="cr-chip" data-cr-estado-op="${esc(op)}" data-cr-role="${c.id}">${esc(op)}</button>`
      ).join('');
      html += `<div class="cr-field">
        <label>${esc(c.label)}</label>
        <input type="text" class="cr-input" data-cr-role="${c.id}" data-cr-tipo="estado" value="${esc(val)}">
        <div class="cr-chips">${chips}</div>
      </div>`;

    } else {
      const largo = (val && val.length > 26) || c.tipo === 'lista';
      const control = largo
        ? `<textarea class="cr-input cr-area" data-cr-role="${c.id}" rows="2">${esc(val)}</textarea>`
        : `<input type="text" class="cr-input" data-cr-role="${c.id}" value="${esc(val)}">`;
      html += `<div class="cr-field"><label>${esc(c.label)}</label>${control}</div>`;
    }
  });

  // Logo (constante de marca) — si la plantilla tiene dónde ponerlo.
  const logoSlot = _crLogoSlot();
  if (logoSlot) {
    const puesto = logoSlot.tipo === 'imagen';
    html += `<div class="cr-field">
      <label>Logo</label>
      <button class="cr-foto-btn ${puesto ? '' : 'cr-falta'}" data-cr-logo="1">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        ${puesto ? 'Cambiar logo' : 'Poner mi logo'}
      </button>
    </div>`;
  }

  bloque.innerHTML = html;
  panel.insertBefore(bloque, panel.firstChild);

  // Edición rápida ya trae su propio botón de foto → sobra el bloque suelto
  // "Falta la foto" de foto-hueco.js. Se quita para no mostrar dos botones.
  if (items.some(c => c.tipo === 'imagen')) {
    const dup = panel.querySelector('#huecoFotoAviso');
    if (dup) dup.remove();
  }
}

/* ══════════ enganches (delegados, sobreviven a repintados) ══════════ */

if (!document.__crBound) {
  document.__crBound = true;

  // Escribir en un campo → actualiza el lienzo al instante.
  document.addEventListener('input', e => {
    const t = e.target;
    if (!t || !t.dataset || t.dataset.crRole == null) return;
    if (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA') return;
    _crEscribir(t.dataset.crRole, t.dataset.crTipo, t.value);
  });

  // Botón de foto y chips de estado.
  document.addEventListener('click', e => {
    const t = e.target && e.target.closest ? e.target.closest('[data-cr-foto],[data-cr-logo],[data-cr-estado-op]') : null;
    if (!t) return;
    e.preventDefault();
    if (t.hasAttribute('data-cr-foto')) { cambiarFotoCampo(); return; }
    if (t.hasAttribute('data-cr-logo')) { ponerLogoCampo(); return; }
    const op = t.getAttribute('data-cr-estado-op');
    if (op != null) _crAplicarEstado(t.getAttribute('data-cr-role') || 'estado', op);
  });

  // Al soltar el campo, un punto de historia para el deshacer.
  document.addEventListener('change', e => {
    const t = e.target;
    if (t && t.dataset && t.dataset.crRole != null && typeof saveState === 'function') saveState();
  });
}

/* El panel se repinta por muchas vías (selección, cambio de herramienta).
   Se re-inyecta después de cada renderPropsPanel para no quedar huérfano —
   la misma lección del botón de la foto. */
function _crEngancharAlPanel() {
  if (typeof renderPropsPanel !== 'function' || renderPropsPanel.__conCampos) return;
  const orig = renderPropsPanel;
  renderPropsPanel = function (obj) {
    orig(obj);
    try { _crInyectar(); } catch (_) {}
  };
  renderPropsPanel.__conCampos = true;
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _crEngancharAlPanel);
} else {
  _crEngancharAlPanel();
}

/* Además: cuando cambia la plantilla o el juego de roles del lienzo (cargar
   una plantilla, poner la foto que quita el hueco), se re-inyecta. La firma
   solo cambia con los ROLES, no con el texto, así que escribir en un campo
   NO dispara un re-pintado (el input no pierde el foco). */
(function engancharAlLienzo() {
  let sig = '';
  canvas.on('after:render', () => {
    const s = (state.currentTemplate || '') + '|' +
      canvas.getObjects().filter(o => o.meta && o.meta.role).map(o => o.meta.role).join(',');
    if (s === sig) return;
    sig = s;
    try { _crInyectar(); } catch (_) {}
  });
})();
