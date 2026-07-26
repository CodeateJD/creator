/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — edit-tools.js
   Bloque de edicion que faltaba:
     · unir / separar (agrupar y desagrupar)
     · alinear y distribuir
     · apariencia del texto: brillo, sombra, contorno y fondo

   Se engancha al panel de propiedades sin reescribirlo: properties.js
   solo llama a injectEditTools() y al panel de seleccion multiple.
   ═══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════
   1. UNIR / SEPARAR
   ══════════════════════════════════════════ */

function groupSelection() {
  const sel = canvas.getActiveObject();
  if (!sel || sel.type !== 'activeSelection') {
    status('Selecciona dos o mas objetos para unirlos');
    return false;
  }
  const grupo = sel.toGroup();
  grupo.meta = { ...(grupo.meta || {}), name: 'Grupo' };
  canvas.requestRenderAll();
  if (typeof saveState === 'function') saveState();
  if (typeof renderLayersPanel === 'function') renderLayersPanel();
  if (typeof renderPropsPanel === 'function') renderPropsPanel(grupo);
  status('Objetos unidos');
  return true;
}

function ungroupSelection() {
  const g = canvas.getActiveObject();
  if (!g || g.type !== 'group') {
    status('Selecciona un grupo para separarlo');
    return false;
  }
  const cuantos = g.getObjects().length;
  g.toActiveSelection();
  canvas.requestRenderAll();
  if (typeof saveState === 'function') saveState();
  if (typeof renderLayersPanel === 'function') renderLayersPanel();
  if (typeof renderPropsPanel === 'function') renderPropsPanel(canvas.getActiveObject());
  status(`Separado en ${cuantos} objetos`);
  return true;
}

/* ══════════════════════════════════════════
   2. ALINEAR Y DISTRIBUIR

   Se trabaja siempre en coordenadas absolutas: si hay una seleccion
   multiple se deshace primero (los hijos vuelven al espacio del lienzo),
   se mueve cada objeto, y se vuelve a seleccionar. Asi se evita la
   aritmetica de coordenadas relativas de Fabric, que es donde suele
   romperse este tipo de funcion.
   ══════════════════════════════════════════ */

function _objetosActivos() {
  const active = canvas.getActiveObject();
  if (!active) return { objs: [], multiple: false };
  if (active.type === 'activeSelection') {
    return { objs: active.getObjects().slice(), multiple: true };
  }
  return { objs: [active], multiple: false };
}

function _reseleccionar(objs) {
  if (objs.length > 1) {
    const sel = new fabric.ActiveSelection(objs, { canvas });
    canvas.setActiveObject(sel);
  } else if (objs.length === 1) {
    canvas.setActiveObject(objs[0]);
  }
  canvas.requestRenderAll();
}

function _limitesDe(objs) {
  let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
  objs.forEach(o => {
    const bb = o.getBoundingRect(true, true);
    l = Math.min(l, bb.left);
    t = Math.min(t, bb.top);
    r = Math.max(r, bb.left + bb.width);
    b = Math.max(b, bb.top + bb.height);
  });
  return { left: l, top: t, right: r, bottom: b, cx: (l + r) / 2, cy: (t + b) / 2 };
}

function alignObjects(modo) {
  const { objs, multiple } = _objetosActivos();
  if (!objs.length) return false;

  if (multiple) canvas.discardActiveObject();

  // Con varios objetos se alinean entre ellos. Con uno solo, contra el lienzo.
  const f = FORMATS[state.format];
  const ref = objs.length > 1
    ? _limitesDe(objs)
    : { left: 0, top: 0, right: f.w, bottom: f.h, cx: f.w / 2, cy: f.h / 2 };

  objs.forEach(o => {
    const bb = o.getBoundingRect(true, true);
    let dx = 0, dy = 0;
    switch (modo) {
      case 'left':    dx = ref.left  - bb.left; break;
      case 'centerH': dx = ref.cx    - (bb.left + bb.width / 2); break;
      case 'right':   dx = ref.right - (bb.left + bb.width); break;
      case 'top':     dy = ref.top    - bb.top; break;
      case 'middleV': dy = ref.cy     - (bb.top + bb.height / 2); break;
      case 'bottom':  dy = ref.bottom - (bb.top + bb.height); break;
    }
    o.set({ left: o.left + dx, top: o.top + dy });
    o.setCoords();
  });

  _reseleccionar(objs);
  if (typeof saveState === 'function') saveState();
  status(objs.length > 1 ? 'Objetos alineados' : 'Alineado al lienzo');
  return true;
}

function distributeObjects(eje) {
  const { objs, multiple } = _objetosActivos();
  if (!multiple || objs.length < 3) {
    status('Necesitas 3 o mas objetos para distribuir');
    return false;
  }
  canvas.discardActiveObject();

  const key = eje === 'h' ? 'left' : 'top';
  const dim = eje === 'h' ? 'width' : 'height';

  const items = objs
    .map(o => ({ o, bb: o.getBoundingRect(true, true) }))
    .sort((a, b) => a.bb[key] - b.bb[key]);

  const inicio = items[0].bb[key];
  const ultimo = items[items.length - 1].bb;
  const fin    = ultimo[key] + ultimo[dim];
  const ocupado = items.reduce((s, it) => s + it.bb[dim], 0);
  const hueco   = (fin - inicio - ocupado) / (items.length - 1);

  let cursor = inicio;
  items.forEach(it => {
    const delta = cursor - it.bb[key];
    if (eje === 'h') it.o.set('left', it.o.left + delta);
    else             it.o.set('top',  it.o.top  + delta);
    it.o.setCoords();
    cursor += it.bb[dim] + hueco;
  });

  _reseleccionar(items.map(it => it.o));
  if (typeof saveState === 'function') saveState();
  status('Espaciado distribuido');
  return true;
}

/* ══════════════════════════════════════════
   3. APARIENCIA DEL TEXTO
   ══════════════════════════════════════════ */

function _hexToHsl(hex) {
  const h = (typeof toHex === 'function' ? toHex(hex) : hex) || '#ffffff';
  const r = parseInt(h.slice(1, 3), 16) / 255;
  const g = parseInt(h.slice(3, 5), 16) / 255;
  const b = parseInt(h.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let s = 0, hh = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r)      hh = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) hh = ((b - r) / d + 2) / 6;
    else                hh = ((r - g) / d + 4) / 6;
  }
  return { h: hh, s, l };
}

function _hslToHex(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const to = v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0');
  return '#' + to(r) + to(g) + to(b);
}

// El brillo mueve solo la luminosidad. El tono y la saturacion se guardan la
// primera vez en meta, si no al llegar a blanco o negro se perderian.
function setTextBrightness(obj, pct) {
  if (!obj.meta) obj.meta = {};
  if (!obj.meta.baseHS) {
    const hsl = _hexToHsl(obj.fill);
    obj.meta.baseHS = { h: hsl.h, s: hsl.s };
  }
  const { h, s } = obj.meta.baseHS;
  obj.set('fill', _hslToHex(h, s, pct / 100));
  canvas.requestRenderAll();
}

function setTextShadow(obj, on, opts = {}) {
  if (!on) { obj.set('shadow', null); canvas.requestRenderAll(); return; }
  const prev = obj.shadow || {};
  obj.set('shadow', new fabric.Shadow({
    color:   opts.color   !== undefined ? opts.color   : (prev.color   || 'rgba(0,0,0,0.6)'),
    blur:    opts.blur    !== undefined ? opts.blur    : (prev.blur    !== undefined ? prev.blur : 12),
    offsetX: opts.offsetX !== undefined ? opts.offsetX : (prev.offsetX || 0),
    offsetY: opts.offsetY !== undefined ? opts.offsetY : (prev.offsetY || 4),
  }));
  canvas.requestRenderAll();
}

// paintFirst:'stroke' dibuja el contorno por fuera de la letra. Sin esto el
// borde se come el relleno y el texto adelgaza en vez de engordar.
function setTextStroke(obj, color, width) {
  obj.set({
    stroke: width > 0 ? color : null,
    strokeWidth: width,
    paintFirst: 'stroke',
    strokeUniform: true,
  });
  canvas.requestRenderAll();
}

function setTextBg(obj, color) {
  obj.set('textBackgroundColor', color || '');
  canvas.requestRenderAll();
}

/* ══════════════════════════════════════════
   4. INTERFAZ
   ══════════════════════════════════════════ */

const _ICO = {
  alignL: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 3v18"/><rect x="7" y="6" width="12" height="4"/><rect x="7" y="14" width="8" height="4"/></svg>',
  alignC: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v18"/><rect x="6" y="6" width="12" height="4"/><rect x="8" y="14" width="8" height="4"/></svg>',
  alignR: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 3v18"/><rect x="5" y="6" width="12" height="4"/><rect x="9" y="14" width="8" height="4"/></svg>',
  alignT: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 4h18"/><rect x="6" y="7" width="4" height="12"/><rect x="14" y="7" width="4" height="8"/></svg>',
  alignM: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18"/><rect x="6" y="6" width="4" height="12"/><rect x="14" y="8" width="4" height="8"/></svg>',
  alignB: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 20h18"/><rect x="6" y="5" width="4" height="12"/><rect x="14" y="9" width="4" height="8"/></svg>',
  distH:  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4v16M20 4v16"/><rect x="10" y="8" width="4" height="8"/></svg>',
  distV:  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16M4 20h16"/><rect x="8" y="10" width="8" height="4"/></svg>',
  unir:   '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><path d="M11 7h4a2 2 0 0 1 2 2v4"/></svg>',
  sep:    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M14 7h-3M17 4v3M7 14v3M4 17h3"/></svg>',
};

function _btnAlign(accion, icono, titulo) {
  return `<button class="edit-btn" data-edit="${accion}" title="${titulo}">${icono}</button>`;
}

function alignSectionHTML(multiple) {
  return `
    <div class="prop-section edit-section">
      <div class="prop-section-title">Alinear ${multiple
        ? '<span class="edit-hint-tag">entre ellos</span>'
        : '<span class="edit-hint-tag">al lienzo</span>'}</div>
      <div class="edit-row">
        ${_btnAlign('align-left',    _ICO.alignL, 'Izquierda')}
        ${_btnAlign('align-centerH', _ICO.alignC, 'Centro horizontal')}
        ${_btnAlign('align-right',   _ICO.alignR, 'Derecha')}
        <span class="edit-sep"></span>
        ${_btnAlign('align-top',     _ICO.alignT, 'Arriba')}
        ${_btnAlign('align-middleV', _ICO.alignM, 'Centro vertical')}
        ${_btnAlign('align-bottom',  _ICO.alignB, 'Abajo')}
      </div>
      ${multiple ? `
      <div class="edit-row" style="margin-top:6px">
        ${_btnAlign('dist-h', _ICO.distH, 'Distribuir horizontal (3+)')}
        ${_btnAlign('dist-v', _ICO.distV, 'Distribuir vertical (3+)')}
        <span class="edit-hint-inline">Distribuir espaciado</span>
      </div>` : ''}
    </div>
  `;
}

function textAppearanceHTML(obj) {
  const hsl   = _hexToHsl(obj.fill);
  const luz   = Math.round(hsl.l * 100);
  const sh    = obj.shadow;
  const shOn  = !!sh;
  const shCol = sh ? (typeof toHex === 'function' ? toHex(sh.color) : '#000000') : '#000000';
  const shBlur= sh ? (sh.blur || 0) : 12;
  const shX   = sh ? (sh.offsetX || 0) : 0;
  const shY   = sh ? (sh.offsetY || 0) : 4;
  // Fabric trae strokeWidth:1 por defecto aunque no haya contorno. El contorno
  // esta activo solo si ademas hay color de trazo.
  const stOn  = !!obj.stroke && (obj.strokeWidth || 0) > 0;
  const stW   = stOn ? obj.strokeWidth : 0;
  const stCol = obj.stroke ? (typeof toHex === 'function' ? toHex(obj.stroke) : '#000000') : '#000000';
  const bgOn  = !!obj.textBackgroundColor;
  const bgCol = bgOn ? (typeof toHex === 'function' ? toHex(obj.textBackgroundColor) : '#000000') : '#000000';

  return `
    <div class="prop-field">
      <label>Brillo <span class="range-val" data-out="edit-bright">${luz}%</span></label>
      <input type="range" class="prop-range edit-bright" min="0" max="100" step="1" value="${luz}">
    </div>

    <div class="edit-sub">
      <label class="edit-switch">
        <input type="checkbox" class="edit-shadow-on" ${shOn ? 'checked' : ''}>
        <span>Sombra</span>
      </label>
      <div class="edit-sub-body ${shOn ? '' : 'is-off'}" data-body="shadow">
        <div class="prop-field">
          <label>Color</label>
          <div class="color-input-wrap">
            <input type="color" class="prop-color edit-shadow-color" value="${shCol}">
          </div>
        </div>
        <div class="prop-field">
          <label>Difuminado <span class="range-val" data-out="edit-shblur">${shBlur}</span></label>
          <input type="range" class="prop-range edit-shadow-blur" min="0" max="60" step="1" value="${shBlur}">
        </div>
        <div class="prop-field">
          <label>Desplazamiento X <span class="range-val" data-out="edit-shx">${shX}</span></label>
          <input type="range" class="prop-range edit-shadow-x" min="-40" max="40" step="1" value="${shX}">
        </div>
        <div class="prop-field">
          <label>Desplazamiento Y <span class="range-val" data-out="edit-shy">${shY}</span></label>
          <input type="range" class="prop-range edit-shadow-y" min="-40" max="40" step="1" value="${shY}">
        </div>
      </div>
    </div>

    <div class="edit-sub">
      <label class="edit-switch">
        <input type="checkbox" class="edit-stroke-on" ${stOn ? 'checked' : ''}>
        <span>Contorno</span>
      </label>
      <div class="edit-sub-body ${stOn ? '' : 'is-off'}" data-body="stroke">
        <div class="prop-field">
          <label>Color</label>
          <div class="color-input-wrap">
            <input type="color" class="prop-color edit-stroke-color" value="${stCol}">
          </div>
        </div>
        <div class="prop-field">
          <label>Grosor <span class="range-val" data-out="edit-stw">${stW}</span></label>
          <input type="range" class="prop-range edit-stroke-w" min="0" max="24" step="0.5" value="${stW}">
        </div>
      </div>
    </div>

    <div class="edit-sub">
      <label class="edit-switch">
        <input type="checkbox" class="edit-bg-on" ${bgOn ? 'checked' : ''}>
        <span>Fondo detras del texto</span>
      </label>
      <div class="edit-sub-body ${bgOn ? '' : 'is-off'}" data-body="bg">
        <div class="prop-field">
          <label>Color</label>
          <div class="color-input-wrap">
            <input type="color" class="prop-color edit-bg-color" value="${bgCol}">
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════════
   5. INYECCION EN EL PANEL
   ══════════════════════════════════════════ */

// properties.js llama a esto desde bindPropsEvents(), justo despues de pintar
// el panel. Aqui se agregan las secciones nuevas y se enganchan sus eventos.
function injectEditTools(container, obj) {
  if (!container || !obj) return;

  const esTexto = ['i-text', 'text', 'textbox'].includes(obj.type);
  const esGrupo = obj.type === 'group';

  /* — apariencia del texto — */
  if (esTexto) {
    const apariencia = [...container.querySelectorAll('.prop-section')]
      .find(s => /Apariencia/i.test(s.querySelector('.prop-section-title')?.textContent || ''));
    if (apariencia && !apariencia.querySelector('.edit-bright')) {
      apariencia.insertAdjacentHTML('beforeend', textAppearanceHTML(obj));
    }
  }

  /* — alinear (siempre, contra el lienzo) — */
  const acciones = [...container.querySelectorAll('.prop-section')]
    .find(s => /Acciones/i.test(s.querySelector('.prop-section-title')?.textContent || ''));
  if (acciones && !container.querySelector('.edit-section')) {
    acciones.insertAdjacentHTML('beforebegin', alignSectionHTML(false));
  }

  /* — separar, si es un grupo — */
  if (esGrupo && acciones && !container.querySelector('[data-edit="ungroup"]')) {
    const fila = acciones.querySelector('.action-row');
    if (fila) {
      fila.insertAdjacentHTML('afterbegin',
        `<button class="action-btn" data-edit="ungroup" title="Separar (Ctrl+Shift+G)">${_ICO.sep}Separar</button>`);
    }
  }

  bindEditToolsEvents(container, obj);
}

// Panel completo para cuando hay varios objetos seleccionados.
function selectionPropsHTML(sel) {
  const n = sel.getObjects().length;
  return `
    <div class="prop-section">
      <div class="prop-section-title">Seleccion multiple</div>
      <p class="hint-text"><strong>${n} objetos</strong> seleccionados.</p>
    </div>

    ${alignSectionHTML(true)}

    <div class="prop-section">
      <div class="prop-section-title">Acciones</div>
      <div class="action-row">
        <button class="action-btn action-primary" data-edit="group" title="Unir (Ctrl+G)">${_ICO.unir}Unir</button>
        <button class="action-btn action-danger" data-edit="delete-sel" title="Eliminar (Del)">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
          Eliminar
        </button>
      </div>
    </div>
  `;
}

function bindEditToolsEvents(container, obj) {
  container = container || $('#panelProps');
  if (!container) return;

  /* — botones de alinear / distribuir / unir / separar — */
  container.querySelectorAll('[data-edit]').forEach(el => {
    if (el.dataset.editBound) return;
    el.dataset.editBound = '1';
    el.addEventListener('click', () => {
      const a = el.dataset.edit;
      if (a.startsWith('align-'))      alignObjects(a.replace('align-', ''));
      else if (a === 'dist-h')         distributeObjects('h');
      else if (a === 'dist-v')         distributeObjects('v');
      else if (a === 'group')          groupSelection();
      else if (a === 'ungroup')        ungroupSelection();
      else if (a === 'delete-sel') {
        const act = canvas.getActiveObject();
        if (act) {
          if (act.type === 'activeSelection') act.getObjects().forEach(o => canvas.remove(o));
          else canvas.remove(act);
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          if (typeof saveState === 'function') saveState();
          if (typeof renderLayersPanel === 'function') renderLayersPanel();
          if (typeof renderPropsPanel === 'function') renderPropsPanel(null);
        }
      }
    });
  });

  if (!obj || !['i-text', 'text', 'textbox'].includes(obj.type)) return;

  const q = sel => container.querySelector(sel);
  const out = (name, v) => {
    const e = container.querySelector(`[data-out="${name}"]`);
    if (e) e.textContent = v;
  };
  const leerSombra = () => ({
    color:   q('.edit-shadow-color')?.value,
    blur:    parseFloat(q('.edit-shadow-blur')?.value || 0),
    offsetX: parseFloat(q('.edit-shadow-x')?.value || 0),
    offsetY: parseFloat(q('.edit-shadow-y')?.value || 0),
  });
  const toggleCuerpo = (nombre, on) => {
    const b = container.querySelector(`[data-body="${nombre}"]`);
    if (b) b.classList.toggle('is-off', !on);
  };

  /* brillo */
  q('.edit-bright')?.addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    setTextBrightness(obj, v);
    out('edit-bright', v + '%');
    // reflejar en el selector de color de arriba
    const c = container.querySelector('.prop-color[data-prop="fill"]');
    const h = container.querySelector('.prop-hex[data-prop="fill"]');
    if (c) c.value = obj.fill;
    if (h) h.value = obj.fill;
  });

  /* sombra */
  q('.edit-shadow-on')?.addEventListener('change', e => {
    toggleCuerpo('shadow', e.target.checked);
    setTextShadow(obj, e.target.checked, leerSombra());
  });
  q('.edit-shadow-color')?.addEventListener('input', () => setTextShadow(obj, true, leerSombra()));
  q('.edit-shadow-blur')?.addEventListener('input', e => {
    out('edit-shblur', e.target.value); setTextShadow(obj, true, leerSombra());
  });
  q('.edit-shadow-x')?.addEventListener('input', e => {
    out('edit-shx', e.target.value); setTextShadow(obj, true, leerSombra());
  });
  q('.edit-shadow-y')?.addEventListener('input', e => {
    out('edit-shy', e.target.value); setTextShadow(obj, true, leerSombra());
  });

  /* contorno */
  q('.edit-stroke-on')?.addEventListener('change', e => {
    const on = e.target.checked;
    toggleCuerpo('stroke', on);
    const slider = q('.edit-stroke-w');
    let w = slider ? parseFloat(slider.value) : 0;
    // al encenderlo por primera vez arranca en 2: en 0 no se veria nada
    if (on && !(w > 0)) {
      w = 2;
      if (slider) slider.value = w;
      out('edit-stw', w);
    }
    setTextStroke(obj, q('.edit-stroke-color')?.value || '#000000', on ? w : 0);
  });
  q('.edit-stroke-color')?.addEventListener('input', e => {
    setTextStroke(obj, e.target.value, parseFloat(q('.edit-stroke-w')?.value || 0));
  });
  q('.edit-stroke-w')?.addEventListener('input', e => {
    out('edit-stw', e.target.value);
    setTextStroke(obj, q('.edit-stroke-color')?.value || '#000000', parseFloat(e.target.value));
  });

  /* fondo del texto */
  q('.edit-bg-on')?.addEventListener('change', e => {
    toggleCuerpo('bg', e.target.checked);
    setTextBg(obj, e.target.checked ? (q('.edit-bg-color')?.value || '#000000') : '');
  });
  q('.edit-bg-color')?.addEventListener('input', e => {
    if (q('.edit-bg-on')?.checked) setTextBg(obj, e.target.value);
  });
}

/* ══════════════════════════════════════════
   6. ATAJOS
   ══════════════════════════════════════════ */

document.addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const t = e.target;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  const act = canvas.getActiveObject();
  if (act && act.isEditing) return;

  if ((e.key === 'g' || e.key === 'G')) {
    e.preventDefault();
    if (e.shiftKey) ungroupSelection();
    else groupSelection();
  }
});
