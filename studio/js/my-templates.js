/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — my-templates.js
   Plantillas propias del usuario: guardar el diseño actual,
   reusarlo, renombrarlo y borrarlo.

   Las 14 plantillas de fabrica viven en el codigo (templates.js).
   Estas viven en localStorage y las crea el usuario.
   ═══════════════════════════════════════════════════════════════ */

const MY_TPL_KEY      = 'codeateJD_studio_my_templates';
const MY_TPL_THUMB_W  = 260;      // ancho de la miniatura en px
const MY_TPL_WARN_MB  = 2;        // aviso si un diseno solo pesa mas que esto

/* ══════════ ALMACEN ══════════ */

function getMyTemplates() {
  try {
    return JSON.parse(localStorage.getItem(MY_TPL_KEY) || '{}');
  } catch { return {}; }
}

function persistMyTemplates(all) {
  let payload;
  try {
    payload = JSON.stringify(all);
  } catch {
    alert('No se pudo preparar la plantilla para guardar.');
    return false;
  }
  try {
    localStorage.setItem(MY_TPL_KEY, payload);
    return true;
  } catch {
    alert(
      'No hay espacio para guardar más plantillas en este navegador.\n\n' +
      'Suele pasar cuando el diseño tiene imágenes pesadas: cada una se guarda ' +
      'completa dentro de la plantilla.\n\n' +
      'Borra alguna plantilla que ya no uses, o vuelve a guardar este diseño ' +
      'con la imagen más liviana.'
    );
    return false;
  }
}

/* ══════════ MINIATURA ══════════ */

// Renderiza el lienzo en chiquito. Igual que downloadCanvas: baja el zoom a 1,
// exporta, y devuelve el zoom a como estaba.
function makeMyTemplateThumb() {
  const f = FORMATS[state.format];
  const origZoom = state.zoom;
  try {
    canvas.setZoom(1);
    canvas.setDimensions({ width: f.w, height: f.h }, { cssOnly: false });
    return canvas.toDataURL({
      format: 'jpeg',
      quality: 0.55,
      multiplier: MY_TPL_THUMB_W / f.w,
    });
  } catch {
    return '';
  } finally {
    applyZoom(origZoom);
  }
}

/* ══════════ GUARDAR ══════════ */

function saveCurrentAsMyTemplate(name) {
  if (typeof isPro === 'function' && !isPro()) {
    if (typeof showUpgradeModal === 'function') showUpgradeModal('guardar');
    return null;
  }
  if (canvas.getObjects().length === 0) {
    status('El lienzo está vacío — no hay nada que guardar');
    return null;
  }

  const all   = getMyTemplates();
  const id    = 'my_' + Date.now();
  const clean = String(name || '').trim().slice(0, 40) || 'Mi plantilla';

  const rec = {
    id,
    name: clean,
    created: Date.now(),
    modified: Date.now(),
    format: state.format,
    json: canvas.toJSON(CANVAS_PROPS),   // CANVAS_PROPS ya incluye 'meta'
    thumb: makeMyTemplateThumb(),
  };

  const sizeMB = JSON.stringify(rec).length / 1048576;
  if (sizeMB > MY_TPL_WARN_MB) {
    const ok = confirm(
      `Este diseño pesa ${sizeMB.toFixed(1)} MB porque lleva imágenes dentro.\n\n` +
      'Puede que no quepan muchas plantillas así. ¿Guardar de todos modos?'
    );
    if (!ok) return null;
  }

  all[id] = rec;
  if (!persistMyTemplates(all)) return null;

  status(`Plantilla guardada: ${clean}`);
  return id;
}

/* ══════════ CARGAR ══════════ */

function loadMyTemplate(id, done) {
  const t = getMyTemplates()[id];
  if (!t) return;

  if (canvas.getObjects().length > 0 &&
      !confirm('Esto reemplazará el contenido actual del lienzo. ¿Continuar?')) return;

  if (t.format && t.format !== state.format) setFormat(t.format);

  history.isRestoring = true;
  canvas.loadFromJSON(t.json, () => {
    canvas.requestRenderAll();
    history.isRestoring = false;
    // Se marca con prefijo my: para que quede activa en el panel, pero sin
    // pool de variantes: applyVariantToCanvas no encuentra nada y no toca el texto.
    state.currentTemplate = 'my:' + id;
    if (typeof renderLayersPanel === 'function') renderLayersPanel();
    if (typeof saveState === 'function') saveState();
    status(`Plantilla: ${t.name}`);
    if (typeof done === 'function') done();
  });
}

/* ══════════ RENOMBRAR / BORRAR ══════════ */

function renameMyTemplate(id) {
  const all = getMyTemplates();
  const t = all[id];
  if (!t) return false;
  const nuevo = prompt('Nombre de la plantilla:', t.name);
  if (nuevo === null) return false;
  const clean = String(nuevo).trim().slice(0, 40);
  if (!clean) return false;
  t.name = clean;
  t.modified = Date.now();
  if (!persistMyTemplates(all)) return false;
  status(`Renombrada: ${clean}`);
  return true;
}

function deleteMyTemplate(id) {
  const all = getMyTemplates();
  const t = all[id];
  if (!t) return false;
  if (!confirm(`¿Eliminar la plantilla "${t.name}"?`)) return false;
  delete all[id];
  if (!persistMyTemplates(all)) return false;
  if (state.currentTemplate === 'my:' + id) state.currentTemplate = null;
  status('Plantilla eliminada');
  return true;
}

/* ══════════ INTERFAZ ══════════ */

function myTemplatesSectionHTML() {
  const pro  = typeof isPro === 'function' ? isPro() : false;
  const list = Object.values(getMyTemplates()).sort((a, b) => b.modified - a.modified);

  const iconSave = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
  const iconPen  = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  const iconDel  = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>';

  const saveBox = `
    <div class="prop-section mytpl-save">
      <div class="prop-section-title">Guardar este diseño</div>
      <div class="mytpl-save-row">
        <input type="text" class="prop-input" id="myTplName"
               placeholder="Nombre de tu plantilla..." maxlength="40" ${pro ? '' : 'disabled'}>
        <button class="mytpl-save-btn" id="myTplSave">${iconSave}${pro ? 'Guardar' : 'Pro'}</button>
      </div>
      <p class="hint-text">${pro
        ? 'Queda en <strong>Mis plantillas</strong> y la reusas cuando quieras. Se guarda tal cual está el lienzo.'
        : 'Guardar tus propias plantillas está disponible en el plan Pro.'}</p>
    </div>
  `;

  if (!list.length) return saveBox;

  const cards = list.map(t => {
    const fecha = new Date(t.modified).toLocaleDateString('es', { day: 'numeric', month: 'short' });
    const fmt = (FORMATS[t.format] && FORMATS[t.format].label) || t.format || '';
    const activa = state.currentTemplate === 'my:' + t.id ? ' active' : '';
    return `
      <div class="mytpl-card${activa}" data-mytpl-id="${t.id}" tabindex="0" role="button">
        <div class="mytpl-thumb">
          ${t.thumb ? `<img src="${t.thumb}" alt="">` : '<span class="mytpl-nothumb">sin vista previa</span>'}
        </div>
        <div class="mytpl-meta">
          <strong>${esc(t.name)}</strong>
          <span>${esc(fmt)} &middot; ${fecha}</span>
        </div>
        <div class="mytpl-actions">
          <button class="mytpl-act" data-mytpl-rename="${t.id}" title="Renombrar">${iconPen}</button>
          <button class="mytpl-act mytpl-act-del" data-mytpl-del="${t.id}" title="Eliminar">${iconDel}</button>
        </div>
      </div>`;
  }).join('');

  return `
    ${saveBox}
    <div class="mytpl-group">
      <div class="template-cat-title mytpl-title">Mis plantillas</div>
      <div class="mytpl-list">${cards}</div>
    </div>
  `;
}

/* ══════════ EVENTOS ══════════ */

function bindMyTemplatesEvents(refresh) {
  const redraw = () => { if (typeof refresh === 'function') refresh(); };

  const doSave = () => {
    const input = $('#myTplName');
    const id = saveCurrentAsMyTemplate(input ? input.value : '');
    if (id) redraw();
  };

  $('#myTplSave')?.addEventListener('click', doSave);
  $('#myTplName')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); doSave(); }
  });

  $$('.mytpl-card').forEach(card => {
    const open = () => loadMyTemplate(card.dataset.mytplId, redraw);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  $$('[data-mytpl-rename]').forEach(b => {
    b.addEventListener('click', e => {
      e.stopPropagation();
      if (renameMyTemplate(b.dataset.mytplRename)) redraw();
    });
  });

  $$('[data-mytpl-del]').forEach(b => {
    b.addEventListener('click', e => {
      e.stopPropagation();
      if (deleteMyTemplate(b.dataset.mytplDel)) redraw();
    });
  });
}
