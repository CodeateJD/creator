/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — storage.js
   Export de imagenes, guardar/cargar proyectos en localStorage
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'codeateJD_studio_projects';
const CANVAS_PROPS = ['meta','selectable','evented','lockMovementX','lockMovementY','lockRotation','lockScalingX','lockScalingY'];

/* ══════════ EXPORT IMAGEN ══════════ */
function downloadCanvas(format, multiplier, quality) {
  if (!isPro() && getRemainingFreeDownloads() === 0) {
    showUpgradeModal('descargas');
    return false;
  }

  const f = FORMATS[state.format];
  const origZoom = state.zoom;

  canvas.setZoom(1);
  canvas.setDimensions({ width: f.w, height: f.h }, { cssOnly: false });

  const baseName = `codeateJD-studio-${f.w * multiplier}x${f.h * multiplier}`;

  if (format === 'svg') {
    const svgData = canvas.toSVG();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    triggerDownload(URL.createObjectURL(blob), `${baseName}.svg`);
    maybeDownloadPublishTxt(baseName);
    applyZoom(origZoom);
    if (!isPro()) incFreeDownloadCount();
    const remaining = isPro() ? null : getRemainingFreeDownloads();
    status(`Exportado: SVG${remaining !== null ? ` — ${remaining} descargas restantes` : ''}`);
    return true;
  }

  // JPG no soporta transparencia: si el lienzo no tiene fondo saldria negro.
  // Se le pone blanco solo para exportar y se devuelve como estaba.
  const bgOriginal = canvas.backgroundColor;
  const sinFondo = !bgOriginal;
  if (format === 'jpeg' && sinFondo) canvas.setBackgroundColor('#ffffff', () => {});

  const dataURL = canvas.toDataURL({
    format: format,
    quality: quality || 1,
    multiplier: multiplier || 1,
  });

  if (format === 'jpeg' && sinFondo) canvas.setBackgroundColor(bgOriginal || '', () => {});

  triggerDownload(dataURL, `${baseName}.${format}`);
  maybeDownloadPublishTxt(baseName);
  applyZoom(origZoom);
  if (!isPro()) incFreeDownloadCount();
  const remaining = isPro() ? null : getRemainingFreeDownloads();
  status(`Exportado: ${format.toUpperCase()} ${multiplier}x${remaining !== null ? ` — ${remaining} descargas restantes` : ''}`);
  return true;
}

function maybeDownloadPublishTxt(baseName) {
  const p = state.publish || {};
  const hasContent = (p.caption && p.caption.trim())
                  || (p.hashtags && p.hashtags.trim())
                  || (p.alt && p.alt.trim());
  if (!hasContent) return;

  const lines = [];
  if (p.caption && p.caption.trim()) {
    lines.push('── DESCRIPCIÓN ──');
    lines.push(p.caption.trim());
    lines.push('');
  }
  if (p.hashtags && p.hashtags.trim()) {
    lines.push('── HASHTAGS ──');
    lines.push(p.hashtags.trim());
    lines.push('');
  }
  if (p.alt && p.alt.trim()) {
    lines.push('── ALT TEXT (accesibilidad) ──');
    lines.push(p.alt.trim());
    lines.push('');
  }
  lines.push('── Generado con codeateJD Studio ──');

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  triggerDownload(URL.createObjectURL(blob), `${baseName}.txt`);
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
}

/* ══════════ GUARDAR PROYECTOS ══════════ */
function getProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveProject(name) {
  if (!isPro()) {
    showUpgradeModal('guardar');
    return null;
  }
  const projects = getProjects();
  const id = 'proj_' + Date.now();
  projects[id] = {
    name: name || 'Sin nombre',
    created: Date.now(),
    modified: Date.now(),
    format: state.format,
    json: canvas.toJSON(CANVAS_PROPS),
    publish: { ...(state.publish || {}) },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  status(`Proyecto guardado: ${name}`);
  return id;
}

function loadProject(id) {
  const projects = getProjects();
  const proj = projects[id];
  if (!proj) return;
  if (proj.format) setFormat(proj.format);
  if (proj.publish) state.publish = { ...proj.publish };
  history.isRestoring = true;
  canvas.loadFromJSON(proj.json, () => {
    canvas.requestRenderAll();
    history.isRestoring = false;
    renderLayersPanel();
    renderPropsPanel(null);
    saveState();
    status(`Proyecto cargado: ${proj.name}`);
  });
}

function deleteProject(id) {
  const projects = getProjects();
  delete projects[id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function exportProjectJSON() {
  const json = canvas.toJSON(CANVAS_PROPS);
  const data = JSON.stringify({ format: state.format, version: '1.3', json }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  triggerDownload(URL.createObjectURL(blob), 'codeateJD-studio-project.json');
  status('Proyecto exportado como JSON');
}

function importProjectJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.format) setFormat(data.format);
        history.isRestoring = true;
        canvas.loadFromJSON(data.json, () => {
          canvas.requestRenderAll();
          history.isRestoring = false;
          renderLayersPanel();
          renderPropsPanel(null);
          saveState();
          status('Proyecto importado desde JSON');
        });
      } catch (err) {
        alert('Error: archivo JSON no valido.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ══════════ MODAL EXPORT ══════════ */
function showExportModal() {
  if ($('#exportModal')) return;

  const projects = getProjects();
  const projList = Object.entries(projects)
    .sort((a, b) => b[1].modified - a[1].modified)
    .map(([id, p]) => {
      const date = new Date(p.modified).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      return `
        <div class="proj-row">
          <div class="proj-info">
            <strong>${esc(p.name)}</strong>
            <span>${date} — ${p.format || 'post'}</span>
          </div>
          <div class="proj-actions">
            <button class="proj-btn" data-proj-load="${id}" title="Cargar">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </button>
            <button class="proj-btn proj-btn-del" data-proj-del="${id}" title="Eliminar">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');

  const f = FORMATS[state.format];
  const pro = isPro();
  const remaining = getRemainingFreeDownloads();
  const dlLimitReached = !pro && remaining === 0;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'exportModal';
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h2>Abrir / Guardar</h2>
        <button class="modal-close" id="modalClose" title="Cerrar (Esc)">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="modal-section">
          <div class="modal-section-title">
            Descargar imagen
            ${!pro ? `<span class="plan-hint">${remaining} de ${FREE_DOWNLOAD_LIMIT} descargas restantes en plan Free</span>` : ''}
          </div>
          <div class="export-grid">
            <div class="prop-field">
              <label>Formato</label>
              <select class="prop-select" id="expFormat">
                <option value="png" selected>PNG (transparencia)</option>
                <option value="jpeg">JPG (mas liviano)</option>
                <option value="webp">WebP (optimo para web)</option>
                <option value="svg">SVG (vectorial)</option>
              </select>
            </div>
            <div class="prop-field">
              <label>Escala</label>
              <div class="toggle-group">
                <button class="toggle-btn active" data-scale="1">1x</button>
                <button class="toggle-btn" data-scale="2">2x</button>
                <button class="toggle-btn" data-scale="3">3x</button>
              </div>
            </div>
          </div>
          <div class="prop-field" id="expQualityWrap" style="display:none">
            <label>Calidad <span class="range-val" id="expQualityVal">90%</span></label>
            <input type="range" class="prop-range" id="expQuality" min="10" max="100" step="5" value="90">
          </div>
          <div class="export-size" id="expSize">${f.w} x ${f.h} px</div>
          <button class="btn-export" id="expDownload" ${dlLimitReached ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${dlLimitReached ? 'Limite alcanzado — Upgrade a Pro' : 'Descargar'}
          </button>
        </div>

        <div class="modal-section">
          <div class="modal-section-title">
            Publicar (opcional)
            <span class="plan-hint">Se descarga un .txt con estos datos junto a la imagen</span>
          </div>
          <div class="prop-field">
            <label>Descripción / Caption</label>
            <textarea class="pub-textarea" id="expPubCaption" rows="3" placeholder="Texto del post..." maxlength="2200">${esc(state.publish?.caption || '')}</textarea>
          </div>
          <div class="prop-field">
            <label>Hashtags</label>
            <textarea class="pub-textarea" id="expPubHashtags" rows="2" placeholder="#diseno #marketing" maxlength="500">${esc(state.publish?.hashtags || '')}</textarea>
          </div>
          <div class="prop-field">
            <label>Alt text (accesibilidad)</label>
            <textarea class="pub-textarea" id="expPubAlt" rows="2" placeholder="Describe la imagen..." maxlength="500">${esc(state.publish?.alt || '')}</textarea>
          </div>
        </div>

        <div class="modal-section">
          <div class="modal-section-title">
            Guardar proyecto
            ${!pro ? '<span class="plan-hint plan-hint-pro">Disponible solo en Pro</span>' : ''}
          </div>
          <div class="save-row">
            <input type="text" class="prop-input" id="projName" placeholder="Nombre del proyecto..." maxlength="60" ${!pro ? 'disabled' : ''}>
            <button class="btn-save" id="projSave">${pro ? 'Guardar' : 'Upgrade a Pro'}</button>
          </div>
          <button class="action-btn" id="projImportJSON" style="width:100%; margin-top:8px" ${!pro ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Importar proyecto
          </button>
        </div>

        ${pro && Object.keys(projects).length > 0 ? `
        <div class="modal-section">
          <div class="modal-section-title">Proyectos guardados</div>
          <div class="proj-list">${projList}</div>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  bindExportModalEvents(overlay);
}

/* ══════════ SHORTCUTS HELP MODAL (Fase 10) ══════════ */
function showShortcutsModal() {
  if ($('#shortcutsModal')) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'shortcutsModal';
  overlay.innerHTML = `
    <div class="modal-card" style="width:520px">
      <div class="modal-header">
        <h2>Atajos de teclado</h2>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()" title="Cerrar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-section">
          <div class="modal-section-title">Herramientas</div>
          <div class="shortcut-grid">
            <div class="shortcut-row"><kbd>V</kbd><span>Mover / Seleccionar</span></div>
            <div class="shortcut-row"><kbd>T</kbd><span>Texto</span></div>
            <div class="shortcut-row"><kbd>R</kbd><span>Formas</span></div>
            <div class="shortcut-row"><kbd>I</kbd><span>Iconos</span></div>
          </div>
        </div>
        <div class="modal-section">
          <div class="modal-section-title">Edicion</div>
          <div class="shortcut-grid">
            <div class="shortcut-row"><kbd>Ctrl+Z</kbd><span>Deshacer</span></div>
            <div class="shortcut-row"><kbd>Ctrl+Y</kbd><span>Rehacer</span></div>
            <div class="shortcut-row"><kbd>Ctrl+D</kbd><span>Duplicar</span></div>
            <div class="shortcut-row"><kbd>Ctrl+A</kbd><span>Seleccionar todo</span></div>
            <div class="shortcut-row"><kbd>Del</kbd><span>Eliminar</span></div>
            <div class="shortcut-row"><kbd>Esc</kbd><span>Deseleccionar</span></div>
          </div>
        </div>
        <div class="modal-section">
          <div class="modal-section-title">Texto</div>
          <div class="shortcut-grid">
            <div class="shortcut-row"><kbd>Ctrl+B</kbd><span>Negrita</span></div>
            <div class="shortcut-row"><kbd>Ctrl+I</kbd><span>Cursiva</span></div>
            <div class="shortcut-row"><kbd>Ctrl+U</kbd><span>Subrayado</span></div>
          </div>
        </div>
        <div class="modal-section">
          <div class="modal-section-title">Navegacion</div>
          <div class="shortcut-grid">
            <div class="shortcut-row"><kbd>Ctrl+0</kbd><span>Ajustar a pantalla</span></div>
            <div class="shortcut-row"><kbd>Ctrl++</kbd><span>Acercar</span></div>
            <div class="shortcut-row"><kbd>Ctrl+-</kbd><span>Alejar</span></div>
            <div class="shortcut-row"><kbd>Ctrl+Scroll</kbd><span>Zoom con rueda</span></div>
            <div class="shortcut-row"><kbd>Flechas</kbd><span>Mover 1px</span></div>
            <div class="shortcut-row"><kbd>Shift+Flechas</kbd><span>Mover 10px</span></div>
          </div>
        </div>
        <div class="modal-section" style="border-bottom:none">
          <div class="modal-section-title">Otros</div>
          <div class="shortcut-grid">
            <div class="shortcut-row"><kbd>?</kbd><span>Mostrar esta ayuda</span></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.addEventListener('keydown', function h(e) {
    if (e.key === 'Escape' && $('#shortcutsModal')) {
      overlay.remove();
      document.removeEventListener('keydown', h);
    }
  });
}

function bindExportModalEvents(overlay) {
  let currentScale = 1;
  const f = () => FORMATS[state.format];

  // Close
  const close = () => overlay.remove();
  overlay.querySelector('#modalClose').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape' && $('#exportModal')) {
      close();
      document.removeEventListener('keydown', escHandler);
    }
  });

  // Format change
  overlay.querySelector('#expFormat').addEventListener('change', (e) => {
    const fmt = e.target.value;
    // Quality slider relevant for jpeg and webp
    overlay.querySelector('#expQualityWrap').style.display = (fmt === 'jpeg' || fmt === 'webp') ? '' : 'none';
    overlay.querySelector('#expSize').textContent = fmt === 'svg'
      ? 'Vectorial (escalable)'
      : `${f().w * currentScale} x ${f().h * currentScale} px`;
  });

  // Scale toggle
  overlay.querySelectorAll('[data-scale]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentScale = parseInt(btn.dataset.scale);
      overlay.querySelectorAll('[data-scale]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const fmt = overlay.querySelector('#expFormat').value;
      if (fmt !== 'svg') {
        overlay.querySelector('#expSize').textContent = `${f().w * currentScale} x ${f().h * currentScale} px`;
      }
    });
  });

  // Quality slider
  overlay.querySelector('#expQuality').addEventListener('input', (e) => {
    overlay.querySelector('#expQualityVal').textContent = e.target.value + '%';
  });

  // Publish fields sync (bidirectional with right panel)
  ['Caption','Hashtags','Alt'].forEach(field => {
    const el = overlay.querySelector('#expPub' + field);
    if (!el) return;
    el.addEventListener('input', e => {
      const key = field.toLowerCase();
      state.publish[key] = e.target.value;
      // Reflect in right panel if open
      const panel = $('#pub' + field);
      if (panel) panel.value = e.target.value;
    });
  });

  // Download
  overlay.querySelector('#expDownload').addEventListener('click', () => {
    if (!isPro() && getRemainingFreeDownloads() === 0) {
      close();
      showUpgradeModal('descargas');
      return;
    }
    // Pull latest values from modal into state
    const capEl = overlay.querySelector('#expPubCaption');
    const tagEl = overlay.querySelector('#expPubHashtags');
    const altEl = overlay.querySelector('#expPubAlt');
    if (capEl) state.publish.caption = capEl.value;
    if (tagEl) state.publish.hashtags = tagEl.value;
    if (altEl) state.publish.alt = altEl.value;

    const format = overlay.querySelector('#expFormat').value;
    const quality = parseInt(overlay.querySelector('#expQuality').value) / 100;
    const ok = downloadCanvas(format, currentScale, quality);
    if (ok) close();
  });

  // Save project
  overlay.querySelector('#projSave').addEventListener('click', () => {
    if (!isPro()) {
      close();
      showUpgradeModal('guardar');
      return;
    }
    const name = overlay.querySelector('#projName').value.trim() || 'Sin nombre';
    saveProject(name);
    close();
    showExportModal();
  });

  // Import JSON
  overlay.querySelector('#projImportJSON')?.addEventListener('click', () => {
    importProjectJSON();
    close();
  });

  // Load / Delete project
  overlay.querySelectorAll('[data-proj-load]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.projLoad;
      if (canvas.getObjects().length > 0 && !confirm('Esto reemplazara el contenido actual. ¿Continuar?')) return;
      loadProject(id);
      close();
    });
  });
  overlay.querySelectorAll('[data-proj-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.projDel;
      if (!confirm('¿Eliminar este proyecto?')) return;
      deleteProject(id);
      close();
      showExportModal();
    });
  });
}
