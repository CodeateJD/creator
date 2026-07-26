/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — tpl-modal.js
   Modal de plantillas con desplegable de rubro.

   Al hacer clic en "Plantilla" ya no aparece una lista apretada en el
   panel: se abre un modal donde primero escoges QUE VAS A DISENAR y
   despues ves solo las plantillas de ese rubro, con su diseno real
   en la miniatura (no un gradiente con el nombre encima).
   ═══════════════════════════════════════════════════════════════ */

const TPL_THUMB_KEY   = 'codeateJD_studio_tpl_thumbs_v2';
const TPL_THUMB_W     = 300;
const TPL_RUBRO_KEY   = 'codeateJD_studio_ultimo_rubro';
const RUBRO_MIS_TPL   = '__mias__';

/* ══════════════════════════════════════════
   1. MINIATURAS REALES

   Las plantillas de fabrica son funciones que dibujan sobre el lienzo
   principal, asi que no hay forma de renderizarlas aparte. Se pintan una
   sola vez, se fotografian y se guarda la foto; el lienzo del usuario se
   respalda antes y se restaura despues.
   ══════════════════════════════════════════ */

function getTplThumbs() {
  try { return JSON.parse(localStorage.getItem(TPL_THUMB_KEY) || '{}'); }
  catch { return {}; }
}

function saveTplThumbs(obj) {
  try { localStorage.setItem(TPL_THUMB_KEY, JSON.stringify(obj)); return true; }
  catch { return false; }   // sin espacio: se sigue sin miniaturas, no es fatal
}

function _fotoDelLienzo(ancho) {
  const f = FORMATS[state.format];
  const zoom = state.zoom;
  try {
    canvas.setZoom(1);
    canvas.setDimensions({ width: f.w, height: f.h }, { cssOnly: false });
    return canvas.toDataURL({ format: 'jpeg', quality: 0.6, multiplier: ancho / f.w });
  } catch { return ''; }
  finally { applyZoom(zoom); }
}

/* Solo puede haber UNA generacion a la vez. Dos a la vez se pisan: una
   fotografia el lienzo mientras la otra lo esta restaurando, y salen
   miniaturas con el dibujo equivocado. Se encolan.                        */
let _colaMiniaturas = Promise.resolve();

function generarMiniaturas(ids, onProgress) {
  const siguiente = _colaMiniaturas.then(() => _generarMiniaturasAhora(ids, onProgress));
  _colaMiniaturas = siguiente.catch(() => {});
  return siguiente;
}

// Genera las que falten. Devuelve el cache completo.
async function _generarMiniaturasAhora(ids, onProgress) {
  const cache = getTplThumbs();
  const faltan = ids.filter(id => !cache[id] && TEMPLATES.some(t => t.id === id));
  if (!faltan.length) return cache;

  // — respaldo de lo que el usuario tiene abierto —
  const backupJSON  = canvas.toJSON(CANVAS_PROPS);
  const backupFmt   = state.format;
  const backupTpl   = state.currentTemplate;
  const backupTrans = document.body.classList.contains('bg-transparent');

  if (typeof history !== 'undefined') history.isRestoring = true;
  if (state.format !== 'post') setFormat('post');

  try {
    for (let i = 0; i < faltan.length; i++) {
      const id = faltan[i];
      if (typeof onProgress === 'function') onProgress(i + 1, faltan.length);
      await new Promise(res => {
        let listo = false;
        const fin = () => { if (!listo) { listo = true; res(); } };
        loadTemplate(id, fin);
        setTimeout(fin, 2500);   // si una plantilla se traba, no bloquea el resto
      });
      const foto = _fotoDelLienzo(TPL_THUMB_W);
      if (foto) cache[id] = foto;
    }
  } catch (e) {
    console.warn('[Studio] no se pudieron generar todas las miniaturas:', e);
  }

  // — devolver el lienzo como estaba —
  await new Promise(res => canvas.loadFromJSON(backupJSON, res));
  if (backupFmt !== state.format) setFormat(backupFmt);
  state.currentTemplate = backupTpl;
  document.body.classList.toggle('bg-transparent', backupTrans);
  if (typeof history !== 'undefined') history.isRestoring = false;
  canvas.requestRenderAll();
  if (typeof renderLayersPanel === 'function') renderLayersPanel();

  saveTplThumbs(cache);
  return cache;
}

function borrarCacheMiniaturas() {
  localStorage.removeItem(TPL_THUMB_KEY);
  status('Vistas previas borradas — se regeneran al abrir plantillas');
}

/* ══════════════════════════════════════════
   2. EL MODAL
   ══════════════════════════════════════════ */

function _ultimoRubro() {
  const guardado = localStorage.getItem(TPL_RUBRO_KEY);
  const todos = getRubros();
  if (guardado === RUBRO_MIS_TPL || todos[guardado]) return guardado;
  return 'general';
}

function openTemplateModal() {
  if ($('#tplModal')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'tplModal';
  overlay.innerHTML = `
    <div class="tplm-card">
      <div class="tplm-head">
        <div>
          <h2>Plantillas</h2>
          <p class="tplm-sub">Escoge tu rubro y te muestro solo las que te sirven.</p>
        </div>
        <button class="modal-close" id="tplmClose" title="Cerrar (Esc)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="tplm-bar">
        <label for="tplmRubro">Que vas a disenar</label>
        <select class="prop-select tplm-select" id="tplmRubro"></select>
        <span class="tplm-count" id="tplmCount"></span>
      </div>

      <div class="tplm-fields" id="tplmFields"></div>

      <div class="tplm-body" id="tplmBody"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const sel = overlay.querySelector('#tplmRubro');
  const todos = getRubros();
  const opciones = [];
  Object.keys(todos).forEach(id => {
    const r = todos[id];
    const n = id === 'general' ? plantillasDeRubro(id).length : plantillasDeRubro(id).length;
    opciones.push(`<option value="${id}">${esc(r.nombre)}${n ? ` (${n})` : ''}</option>`);
  });
  const mias = typeof getMyTemplates === 'function' ? Object.keys(getMyTemplates()).length : 0;
  opciones.unshift(`<option value="${RUBRO_MIS_TPL}">⭐ Mis plantillas${mias ? ` (${mias})` : ''}</option>`);
  sel.innerHTML = opciones.join('');
  sel.value = _ultimoRubro();

  const pintar = () => {
    localStorage.setItem(TPL_RUBRO_KEY, sel.value);
    renderTplModalBody(overlay, sel.value);
  };
  sel.addEventListener('change', pintar);

  // OJO: no llamar a esta funcion "esc" — ensombreceria la esc() global de
  // utils.js que escapa el HTML, y todos los nombres saldrian como undefined.
  const alPulsarEscape = e => { if (e.key === 'Escape' && $('#tplModal')) cerrar(); };
  const cerrar = () => {
    overlay.remove();
    document.removeEventListener('keydown', alPulsarEscape);
  };
  overlay.querySelector('#tplmClose').addEventListener('click', cerrar);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });
  document.addEventListener('keydown', alPulsarEscape);
  overlay._cerrar = cerrar;

  pintar();
}

function renderTplModalBody(overlay, rubroId) {
  const body   = overlay.querySelector('#tplmBody');
  const count  = overlay.querySelector('#tplmCount');
  const fields = overlay.querySelector('#tplmFields');
  const pro    = typeof hasPlantillasAccess === 'function' ? hasPlantillasAccess() : true;

  /* — Mis plantillas — */
  if (rubroId === RUBRO_MIS_TPL) {
    fields.innerHTML = '';
    fields.style.display = 'none';
    const mias = typeof getMyTemplates === 'function'
      ? Object.values(getMyTemplates()).sort((a, b) => b.modified - a.modified) : [];
    count.textContent = mias.length ? `${mias.length} guardadas` : '';
    if (!mias.length) {
      body.innerHTML = `
        <div class="tplm-vacio">
          <strong>Todavia no has guardado ninguna.</strong>
          <p>Disena algo en el lienzo y usa <em>Guardar este diseno</em> en el panel de la derecha. Aparecera aqui.</p>
        </div>`;
      return;
    }
    body.innerHTML = `<div class="tplm-grid">${mias.map(t => `
      <button class="tplm-card-tpl" data-mia="${t.id}">
        <div class="tplm-thumb">${t.thumb ? `<img src="${t.thumb}" alt="">` : ''}</div>
        <div class="tplm-info"><strong>${esc(t.name)}</strong><span>${esc((FORMATS[t.format] && FORMATS[t.format].label) || '')}</span></div>
      </button>`).join('')}</div>`;
    body.querySelectorAll('[data-mia]').forEach(b => {
      b.addEventListener('click', () => {
        loadMyTemplate(b.dataset.mia, () => {
          if (typeof renderPropsPanel === 'function') renderPropsPanel(null);
        });
        overlay._cerrar();
      });
    });
    return;
  }

  /* — Rubro de fabrica o propio — */
  const rubro = getRubro(rubroId);
  if (!rubro) { body.innerHTML = ''; return; }

  // Los campos del rubro: aqui se ve que el rubro NO es solo una etiqueta
  fields.style.display = '';
  fields.innerHTML = `
    <span class="tplm-fields-label">Su ficha</span>
    ${(rubro.campos || []).map(c =>
      `<span class="tplm-chip${['precio','estado'].includes(c.tipo) ? ' key' : ''}">${esc(c.label)}</span>`).join('')}
  `;

  let ids = plantillasDeRubro(rubroId);
  const propias = ids.length > 0;
  let aviso = '';
  if (!propias) {
    ids = plantillasDeRubro('general');
    aviso = `
      <div class="tplm-aviso">
        <strong>A este rubro todavia le faltan sus plantillas.</strong>
        <p>Mientras tanto te muestro las que sirven para cualquier negocio. Sus campos ya estan definidos arriba — solo falta disenarles las piezas.</p>
      </div>`;
  }

  count.textContent = `${ids.length} plantilla${ids.length === 1 ? '' : 's'}`;

  // let, no const: al terminar de generarlas se reemplaza y se repinta la grilla
  let thumbs = getTplThumbs();
  const faltan = ids.filter(id => !thumbs[id]);

  const tarjeta = id => {
    const t = TEMPLATES.find(x => x.id === id);
    if (!t) return '';
    const foto = thumbs[id];
    return `
      <button class="tplm-card-tpl ${pro ? '' : 'locked'}" data-tpl="${id}">
        <div class="tplm-thumb" style="${foto ? '' : `background:${t.gradient}`}">
          ${foto ? `<img src="${foto}" alt="">` : `<span class="tplm-thumb-label">${esc(t.name)}</span>`}
          ${pro ? '' : '<span class="tplm-lock">PRO</span>'}
        </div>
        <div class="tplm-info"><strong>${esc(t.name)}</strong><span>${esc(t.desc)}</span></div>
      </button>`;
  };

  body.innerHTML = `
    ${aviso}
    ${faltan.length ? `<div class="tplm-prog" id="tplmProg"><span>Preparando las vistas previas… <b id="tplmProgN">0/${faltan.length}</b></span><div class="tplm-bar-prog"><i id="tplmProgBar"></i></div></div>` : ''}
    <div class="tplm-grid" id="tplmGrid">${ids.map(tarjeta).join('')}</div>
  `;

  const enganchar = () => {
    body.querySelectorAll('[data-tpl]').forEach(b => {
      b.addEventListener('click', () => {
        if (!pro) { overlay._cerrar(); showUpgradeModal('plantillas'); return; }
        const id = b.dataset.tpl;
        if (canvas.getObjects().length > 0 &&
            !confirm('Esto reemplazara el contenido actual del lienzo. Continuar?')) return;
        loadTemplate(id, () => {
          if (typeof renderPropsPanel === 'function') renderPropsPanel(null);
        });
        overlay._cerrar();
      });
    });
  };
  enganchar();

  // Generar las miniaturas que falten, sin bloquear el modal
  if (faltan.length) {
    const nEl   = overlay.querySelector('#tplmProgN');
    const barEl = overlay.querySelector('#tplmProgBar');
    generarMiniaturas(ids, (hechas, total) => {
      if (nEl)   nEl.textContent = `${hechas}/${total}`;
      if (barEl) barEl.style.width = Math.round((hechas / total) * 100) + '%';
    }).then(cacheNuevo => {
      if (!document.body.contains(overlay)) return;
      if (overlay.querySelector('#tplmRubro').value !== rubroId) return;
      thumbs = cacheNuevo || getTplThumbs();
      const prog = overlay.querySelector('#tplmProg');
      if (prog) prog.remove();
      const grid = overlay.querySelector('#tplmGrid');
      if (grid) { grid.innerHTML = ids.map(tarjeta).join(''); enganchar(); }
    });
  }
}

/* ══════════════════════════════════════════
   3. ENGANCHE
   ══════════════════════════════════════════ */

// El boton "Plantilla" de la barra lateral abre el modal ademas de cambiar
// de herramienta. El panel de la derecha sigue sirviendo para guardar el
// diseno actual y ver cual esta aplicada.
function bindTemplateModalTrigger() {
  const btn = document.querySelector('[data-tool="template"]');
  if (!btn || btn.dataset.modalBound) return;
  btn.dataset.modalBound = '1';
  btn.addEventListener('click', () => setTimeout(openTemplateModal, 60));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindTemplateModalTrigger);
} else {
  bindTemplateModalTrigger();
}
