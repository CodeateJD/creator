/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — properties.js
   Renderizado del panel derecho: props por tipo de objeto
   ═══════════════════════════════════════════════════════════════ */

function setPanel(panel) {
  $$('.panel-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.panel === panel);
  });
  $$('.panel-content').forEach(c => c.classList.add('hidden'));
  const targetId = panel === 'props' ? '#panelProps'
                 : panel === 'layers' ? '#panelLayers'
                 : panel === 'publish' ? '#panelPublish'
                 : '#panelProps';
  $(targetId)?.classList.remove('hidden');
  if (panel === 'layers') renderLayersPanel();
  if (panel === 'publish') renderPublishPanel();
}

function publishPanelHTML() {
  const p = state.publish || {};
  return `
    <div class="pub-section">
      <div class="pub-header">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>Publicar</span>
      </div>
      <p class="pub-hint">Estos datos se descargan en un <b>.txt</b> junto a la imagen, listo para copiar y pegar al publicar.</p>
    </div>

    <div class="pub-section">
      <label class="pub-label">Descripción / Caption</label>
      <textarea class="pub-textarea" id="pubCaption" rows="4" placeholder="Texto del post que acompaña la imagen..." maxlength="2200">${escHtml(p.caption)}</textarea>
      <div class="pub-meta"><span id="pubCaptionCount">${(p.caption || '').length}</span> / 2200</div>
    </div>

    <div class="pub-section">
      <label class="pub-label">Hashtags</label>
      <textarea class="pub-textarea" id="pubHashtags" rows="3" placeholder="#diseno #redessociales #marketing" maxlength="500">${escHtml(p.hashtags)}</textarea>
      <div class="pub-meta"><span id="pubHashtagsCount">${countHashtags(p.hashtags)}</span> hashtags — max 30 en IG</div>
    </div>

    <div class="pub-section">
      <label class="pub-label">Alt text (accesibilidad)</label>
      <textarea class="pub-textarea" id="pubAlt" rows="3" placeholder="Describe la imagen para personas con discapacidad visual..." maxlength="500">${escHtml(p.alt)}</textarea>
      <div class="pub-meta"><span id="pubAltCount">${(p.alt || '').length}</span> / 500</div>
    </div>
  `;
}

function escHtml(s) {
  return (s || '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
}

function countHashtags(text) {
  if (!text) return 0;
  const matches = text.match(/#\w+/g);
  return matches ? matches.length : 0;
}

function renderPublishPanel() {
  const container = $('#panelPublish');
  if (!container) return;
  container.innerHTML = publishPanelHTML();
  bindPublishPanelEvents();
}

function bindPublishPanelEvents() {
  const cap = $('#pubCaption');
  const tags = $('#pubHashtags');
  const alt = $('#pubAlt');
  if (cap) {
    cap.addEventListener('input', e => {
      state.publish.caption = e.target.value;
      $('#pubCaptionCount').textContent = e.target.value.length;
    });
  }
  if (tags) {
    tags.addEventListener('input', e => {
      state.publish.hashtags = e.target.value;
      $('#pubHashtagsCount').textContent = countHashtags(e.target.value);
    });
  }
  if (alt) {
    alt.addEventListener('input', e => {
      state.publish.alt = e.target.value;
      $('#pubAltCount').textContent = e.target.value.length;
    });
  }
}

function renderPropsPanel(obj) {
  const container = $('#panelProps');
  if (!container) return;

  if (!obj) {
    if (state.tool === 'shape') {
      container.innerHTML = shapePickerHTML();
      bindShapePickerEvents();
      return;
    }
    if (state.tool === 'background') {
      container.innerHTML = backgroundPanelHTML();
      bindBackgroundEvents();
      return;
    }
    if (state.tool === 'icon') {
      container.innerHTML = iconPickerHTML();
      bindIconPickerEvents();
      return;
    }
    if (state.tool === 'template') {
      container.innerHTML = templatePickerHTML();
      bindTemplatePickerEvents();
      return;
    }
    container.innerHTML = emptyPropsHTML();
    return;
  }

  // Varios objetos seleccionados: panel propio con alinear, distribuir y unir
  if (obj.type === 'activeSelection' && typeof selectionPropsHTML === 'function') {
    container.innerHTML = selectionPropsHTML(obj);
    if (typeof bindEditToolsEvents === 'function') bindEditToolsEvents(container, obj);
    return;
  }

  if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
    container.innerHTML = textPropsHTML(obj);
    bindPropsEvents(obj);
    return;
  }

  if (obj.type === 'image') {
    container.innerHTML = imagePropsHTML(obj);
    bindPropsEvents(obj);
    return;
  }

  if (['rect','circle','triangle','line','polygon','path'].includes(obj.type)) {
    container.innerHTML = shapePropsHTML(obj);
    bindPropsEvents(obj);
    return;
  }

  container.innerHTML = genericPropsHTML(obj);
  bindPropsEvents(obj);
}

/* ══════════ EMPTY ══════════ */
function emptyPropsHTML() {
  return `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><path d="M3 3l7.07 17.39 2.51-7.11 7.11-2.51L3 3z"/></svg>
      <p>Selecciona un elemento del lienzo para ver y editar sus propiedades.</p>
    </div>`;
}

/* ══════════ TEXT ══════════ */
function textPropsHTML(obj) {
  const weight = Number(obj.fontWeight) || 400;
  const size = Math.round(obj.fontSize || 72);
  const color = toHex(obj.fill || '#0f172a');
  const align = obj.textAlign || 'left';
  const lineH = obj.lineHeight ?? 1.16;
  const charS = obj.charSpacing || 0;
  const italic = obj.fontStyle === 'italic';
  const underline = !!obj.underline;
  const isBold = weight >= 700;
  const opacity = Math.round((obj.opacity ?? 1) * 100);

  const fontsOptions = FONTS.map(f =>
    `<option value="${f.family}" ${obj.fontFamily === f.family ? 'selected' : ''} style="font-family:'${f.family}'">${f.name}</option>`
  ).join('');

  return `
    <div class="prop-section">
      <div class="prop-section-title">Texto</div>

      <div class="prop-field">
        <label>Fuente</label>
        <select class="prop-select" data-prop="fontFamily" style="font-family:'${esc(obj.fontFamily)}'">
          ${fontsOptions}
        </select>
      </div>

      <div class="field-grid-2">
        <div class="prop-field">
          <label>Tamano</label>
          <input type="number" class="prop-input" data-prop="fontSize" value="${size}" min="8" max="600" step="1">
        </div>
        <div class="prop-field">
          <label>Peso</label>
          <select class="prop-select" data-prop="fontWeight">
            <option value="400" ${weight===400?'selected':''}>400 Regular</option>
            <option value="500" ${weight===500?'selected':''}>500 Medium</option>
            <option value="600" ${weight===600?'selected':''}>600 Semibold</option>
            <option value="700" ${weight===700?'selected':''}>700 Bold</option>
            <option value="800" ${weight===800?'selected':''}>800 Extrabold</option>
            <option value="900" ${weight===900?'selected':''}>900 Black</option>
          </select>
        </div>
      </div>

      <div class="prop-field">
        <label>Color del texto</label>
        <div class="color-input-wrap">
          <input type="color" class="prop-color" data-prop="fill" value="${color}">
          <input type="text" class="prop-hex" data-prop="fill" value="${color}" maxlength="7" spellcheck="false">
        </div>
      </div>

      <div class="prop-field">
        <label>Estilo</label>
        <div class="toggle-group">
          <button type="button" class="toggle-btn ${isBold?'active':''}" data-action="bold" title="Negrita (Ctrl+B)"><b>B</b></button>
          <button type="button" class="toggle-btn ${italic?'active':''}" data-action="italic" title="Cursiva (Ctrl+I)"><i>I</i></button>
          <button type="button" class="toggle-btn ${underline?'active':''}" data-action="underline" title="Subrayado (Ctrl+U)"><u>U</u></button>
        </div>
      </div>

      <div class="prop-field">
        <label>Alineacion</label>
        <div class="toggle-group">
          <button type="button" class="toggle-btn ${align==='left'?'active':''}" data-action="align-left" title="Izquierda">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          </button>
          <button type="button" class="toggle-btn ${align==='center'?'active':''}" data-action="align-center" title="Centrado">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
          </button>
          <button type="button" class="toggle-btn ${align==='right'?'active':''}" data-action="align-right" title="Derecha">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
          </button>
          <button type="button" class="toggle-btn ${align==='justify'?'active':''}" data-action="align-justify" title="Justificado">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div class="prop-field">
        <label>Interlineado <span class="range-val" data-out="lineHeight">${Number(lineH).toFixed(2)}</span></label>
        <input type="range" class="prop-range" data-prop="lineHeight" min="0.8" max="3" step="0.05" value="${lineH}">
      </div>

      <div class="prop-field">
        <label>Interletraje <span class="range-val" data-out="charSpacing">${charS}</span></label>
        <input type="range" class="prop-range" data-prop="charSpacing" min="-200" max="800" step="10" value="${charS}">
      </div>
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Apariencia</div>
      <div class="prop-field">
        <label>Opacidad <span class="range-val" data-out="opacity">${opacity}%</span></label>
        <input type="range" class="prop-range-pct" data-prop="opacity" min="0" max="100" step="1" value="${opacity}">
      </div>
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Acciones</div>
      <div class="action-row">
        <button class="action-btn" data-action="duplicate" title="Duplicar (Ctrl+D)">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Duplicar
        </button>
        <button class="action-btn action-danger" data-action="delete" title="Eliminar (Del)">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
          Eliminar
        </button>
      </div>
    </div>
  `;
}

/* ══════════ IMAGE (Fase 3) ══════════ */
function imagePropsHTML(obj) {
  const opacity = Math.round((obj.opacity ?? 1) * 100);
  const filters = obj.filters || [];
  const getF = (t) => filters.find(f => f && f.type === t);

  const brightness = getF('Brightness')?.brightness ?? 0;
  const contrast   = getF('Contrast')?.contrast ?? 0;
  const saturation = getF('Saturation')?.saturation ?? 0;
  const blur       = getF('Blur')?.blur ?? 0;
  const isGray    = !!getF('Grayscale');
  const isSepia   = !!getF('Sepia');
  const isInvert  = !!getF('Invert');
  const isVintage = !!getF('Vintage');
  const isPixel   = !!getF('Pixelate');
  const isNoise   = !!getF('Noise');
  const isSharpen = filters.some(f => f && f._studioKind === 'Sharpen');
  const isEmboss  = filters.some(f => f && f._studioKind === 'Emboss');

  const curW = Math.round((obj.width || 0) * (obj.scaleX || 1));
  const curH = Math.round((obj.height || 0) * (obj.scaleY || 1));
  const lockAspect = obj._studioLockAspect !== false; // default on

  return `
    <div class="prop-section">
      <div class="prop-section-title">Imagen</div>

      <div class="prop-field">
        <label>Tamaño</label>
        <div class="resize-row">
          <div class="resize-group">
            <span class="resize-axis">W</span>
            <input type="number" class="prop-input resize-input" id="imgW" value="${curW}" min="1" max="10000" step="1">
          </div>
          <button type="button" class="resize-lock ${lockAspect?'locked':''}" id="imgLock" title="Mantener proporción">
            <svg class="lock-closed" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <svg class="lock-open" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
          </button>
          <div class="resize-group">
            <span class="resize-axis">H</span>
            <input type="number" class="prop-input resize-input" id="imgH" value="${curH}" min="1" max="10000" step="1">
          </div>
        </div>
        <div class="resize-presets">
          <button class="resize-preset-btn" data-resize-pct="50">50%</button>
          <button class="resize-preset-btn" data-resize-pct="100">100%</button>
          <button class="resize-preset-btn" data-resize-pct="200">200%</button>
          <button class="resize-preset-btn" data-resize-fit="width" title="Ajustar al ancho del canvas">↔ Canvas</button>
          <button class="resize-preset-btn" data-resize-fit="height" title="Ajustar al alto del canvas">↕ Canvas</button>
        </div>
      </div>

      <div class="prop-field">
        <label>Transformar</label>
        <div class="toggle-group">
          <button type="button" class="toggle-btn ${obj.flipX?'active':''}" data-action="flip-x" title="Voltear horizontal">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M7 16l-4-4 4-4"/><path d="M17 16l4-4-4-4"/></svg>
          </button>
          <button type="button" class="toggle-btn ${obj.flipY?'active':''}" data-action="flip-y" title="Voltear vertical">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M8 7l4-4 4 4"/><path d="M8 17l4 4 4-4"/></svg>
          </button>
          <button type="button" class="toggle-btn" data-action="rotate-90" title="Rotar 90°">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
        </div>
      </div>

      <div class="prop-field">
        <button class="action-btn" data-action="crop-image" style="width:100%">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>
          Recortar imagen
        </button>
      </div>
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Ajustes</div>
      <div class="prop-field">
        <label>Brillo <span class="range-val" data-out="flt-brightness">${Math.round(brightness * 100)}</span></label>
        <input type="range" class="prop-filter" data-filter="Brightness" data-key="brightness" min="-0.5" max="0.5" step="0.05" value="${brightness}">
      </div>
      <div class="prop-field">
        <label>Contraste <span class="range-val" data-out="flt-contrast">${Math.round(contrast * 100)}</span></label>
        <input type="range" class="prop-filter" data-filter="Contrast" data-key="contrast" min="-0.5" max="0.5" step="0.05" value="${contrast}">
      </div>
      <div class="prop-field">
        <label>Saturacion <span class="range-val" data-out="flt-saturation">${Math.round(saturation * 100)}</span></label>
        <input type="range" class="prop-filter" data-filter="Saturation" data-key="saturation" min="-1" max="1" step="0.05" value="${saturation}">
      </div>
      <div class="prop-field">
        <label>Desenfoque <span class="range-val" data-out="flt-blur">${Math.round(blur * 100)}</span></label>
        <input type="range" class="prop-filter" data-filter="Blur" data-key="blur" min="0" max="0.5" step="0.02" value="${blur}">
      </div>
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Filtros</div>
      <div class="prop-field">
        <div class="toggle-group" style="flex-wrap:wrap">
          <button type="button" class="toggle-btn ${isGray?'active':''}" data-action="effect-Grayscale">B/N</button>
          <button type="button" class="toggle-btn ${isSepia?'active':''}" data-action="effect-Sepia">Sepia</button>
          <button type="button" class="toggle-btn ${isInvert?'active':''}" data-action="effect-Invert">Neg</button>
          <button type="button" class="toggle-btn ${isVintage?'active':''}" data-action="effect-Vintage">Vintage</button>
          <button type="button" class="toggle-btn ${isPixel?'active':''}" data-action="effect-Pixelate">Pixel</button>
          <button type="button" class="toggle-btn ${isNoise?'active':''}" data-action="effect-Noise">Ruido</button>
          <button type="button" class="toggle-btn ${isSharpen?'active':''}" data-action="effect-Sharpen">Nitidez</button>
          <button type="button" class="toggle-btn ${isEmboss?'active':''}" data-action="effect-Emboss">Relieve</button>
        </div>
      </div>
      <div class="prop-field">
        <button class="action-btn" data-action="filter-reset" style="width:100%">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          Restablecer ajustes y filtros
        </button>
      </div>
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Apariencia</div>
      <div class="prop-field">
        <label>Opacidad <span class="range-val" data-out="opacity">${opacity}%</span></label>
        <input type="range" class="prop-range-pct" data-prop="opacity" min="0" max="100" step="1" value="${opacity}">
      </div>
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Acciones</div>
      <div class="action-row">
        <button class="action-btn" data-action="duplicate">Duplicar</button>
        <button class="action-btn action-danger" data-action="delete">Eliminar</button>
      </div>
    </div>
  `;
}

/* ══════════ GENERIC ══════════ */
function genericPropsHTML(obj) {
  const opacity = Math.round((obj.opacity ?? 1) * 100);
  return `
    <div class="prop-section">
      <div class="prop-section-title">${esc(obj.type || 'Elemento')}</div>
      <div class="prop-field">
        <label>Opacidad <span class="range-val" data-out="opacity">${opacity}%</span></label>
        <input type="range" class="prop-range-pct" data-prop="opacity" min="0" max="100" step="1" value="${opacity}">
      </div>
    </div>
    <div class="prop-section">
      <div class="prop-section-title">Acciones</div>
      <div class="action-row">
        <button class="action-btn" data-action="duplicate">Duplicar</button>
        <button class="action-btn action-danger" data-action="delete">Eliminar</button>
      </div>
    </div>
  `;
}

/* ══════════ EVENT BINDING ══════════ */
function bindPropsEvents(obj) {
  const container = $('#panelProps');
  if (!container) return;

  // Bloque de edicion (edit-tools.js): alinear, separar y apariencia del texto
  if (typeof injectEditTools === 'function') injectEditTools(container, obj);

  // Props directas (fill, fontFamily, fontSize, fontWeight, opacity, lineHeight, charSpacing)
  container.querySelectorAll('[data-prop]').forEach(el => {
    el.addEventListener('input', () => {
      const prop = el.dataset.prop;
      let v = el.value;

      if (el.type === 'number' || el.type === 'range') v = parseFloat(v);
      if (prop === 'fontWeight') v = parseInt(v);
      if (prop === 'opacity' && el.classList.contains('prop-range-pct')) v = parseFloat(v) / 100;

      if (el.classList.contains('prop-color') || el.classList.contains('prop-hex')) {
        const parent = el.closest('.color-input-wrap');
        if (parent) {
          if (el.classList.contains('prop-color')) {
            const h = parent.querySelector('.prop-hex');
            if (h) h.value = v;
          } else {
            if (!/^#[0-9a-fA-F]{6}$/.test(v)) return;
            const c = parent.querySelector('.prop-color');
            if (c) c.value = v;
          }
        }
      }

      if (prop === 'fontFamily') {
        el.style.fontFamily = `'${v}'`;
      }

      obj.set(prop, v);
      if (prop === 'rx' && obj.type === 'rect') obj.set('ry', v);

      // Fabric cachea metricas: re-medir cuando cambian props que afectan tamano de texto
      const textSizeProps = ['fontFamily', 'fontWeight', 'fontSize', 'fontStyle', 'lineHeight', 'charSpacing'];
      if (textSizeProps.includes(prop)) reflowText(obj);

      canvas.requestRenderAll();

      const out = container.querySelector(`[data-out="${prop}"]`);
      if (out) {
        if (prop === 'lineHeight') out.textContent = Number(v).toFixed(2);
        else if (prop === 'opacity') out.textContent = Math.round(v * 100) + '%';
        else out.textContent = v;
      }
    });
  });

  // Filtros de imagen
  container.querySelectorAll('.prop-filter').forEach(el => {
    el.addEventListener('input', () => {
      const filterType = el.dataset.filter;
      const filterKey  = el.dataset.key;
      const value = parseFloat(el.value);
      updateImageFilter(obj, filterType, filterKey, value);
      const out = container.querySelector(`[data-out="flt-${filterKey}"]`);
      if (out) out.textContent = Math.round(value * 100);
    });
  });

  // Acciones (bold, italic, underline, align-*, flip-*, rotate-90, effect-*, filter-reset, duplicate, delete)
  container.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => {
      const a = el.dataset.action;

      // Texto
      if (a === 'bold') {
        const isB = Number(obj.fontWeight) >= 700;
        obj.set('fontWeight', isB ? 400 : 700);
        reflowText(obj);
        el.classList.toggle('active', !isB);
        const sel = container.querySelector('[data-prop="fontWeight"]');
        if (sel) sel.value = obj.fontWeight;
      } else if (a === 'italic') {
        obj.set('fontStyle', obj.fontStyle === 'italic' ? 'normal' : 'italic');
        reflowText(obj);
        el.classList.toggle('active');
      } else if (a === 'underline') {
        obj.set('underline', !obj.underline);
        el.classList.toggle('active');
      } else if (a.startsWith('align-')) {
        const alignVal = a.replace('align-', '');
        obj.set('textAlign', alignVal);
        container.querySelectorAll('[data-action^="align-"]').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
      }

      // Imagen: transforms
      else if (a === 'flip-x') {
        obj.set('flipX', !obj.flipX);
        el.classList.toggle('active', obj.flipX);
      } else if (a === 'flip-y') {
        obj.set('flipY', !obj.flipY);
        el.classList.toggle('active', obj.flipY);
      } else if (a === 'rotate-90') {
        obj.rotate(((obj.angle || 0) + 90) % 360);
      } else if (a === 'crop-image') {
        if (typeof startImageCrop === 'function') startImageCrop(obj);
      }

      // Imagen: efectos on/off
      else if (a.startsWith('effect-')) {
        const effect = a.replace('effect-', '');
        const active = toggleImageEffect(obj, effect);
        el.classList.toggle('active', active);
      } else if (a === 'filter-reset') {
        resetImageFilters(obj);
        renderPropsPanel(obj);
        return;
      }

      // Comunes
      else if (a === 'duplicate') {
        obj.clone(cl => {
          cl.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
          canvas.add(cl);
          canvas.setActiveObject(cl);
          canvas.requestRenderAll();
        });
      } else if (a === 'delete') {
        canvas.remove(obj);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        renderPropsPanel(null);
      }

      canvas.requestRenderAll();
    });
  });

  // ══════════ Resize numérico para imagen ══════════
  if (obj.type === 'image') {
    const wInput = container.querySelector('#imgW');
    const hInput = container.querySelector('#imgH');
    const lockBtn = container.querySelector('#imgLock');

    if (wInput && hInput && lockBtn) {
      const getLock = () => obj._studioLockAspect !== false;

      const setSize = (w, h) => {
        if (w > 0) obj.set('scaleX', w / obj.width);
        if (h > 0) obj.set('scaleY', h / obj.height);
        obj.setCoords();
        canvas.requestRenderAll();
        if (typeof saveState === 'function') saveState();
      };

      wInput.addEventListener('input', () => {
        const w = parseFloat(wInput.value);
        if (!w || w <= 0) return;
        if (getLock()) {
          const ratio = (obj.height || 1) / (obj.width || 1);
          const h = Math.round(w * ratio);
          hInput.value = h;
          setSize(w, h);
        } else {
          setSize(w, parseFloat(hInput.value));
        }
      });
      hInput.addEventListener('input', () => {
        const h = parseFloat(hInput.value);
        if (!h || h <= 0) return;
        if (getLock()) {
          const ratio = (obj.width || 1) / (obj.height || 1);
          const w = Math.round(h * ratio);
          wInput.value = w;
          setSize(w, h);
        } else {
          setSize(parseFloat(wInput.value), h);
        }
      });

      lockBtn.addEventListener('click', () => {
        obj._studioLockAspect = !getLock();
        lockBtn.classList.toggle('locked', getLock());
      });

      container.querySelectorAll('[data-resize-pct]').forEach(btn => {
        btn.addEventListener('click', () => {
          const pct = parseFloat(btn.dataset.resizePct) / 100;
          obj.set('scaleX', pct).set('scaleY', pct);
          obj.setCoords();
          canvas.requestRenderAll();
          renderPropsPanel(obj);
          if (typeof saveState === 'function') saveState();
        });
      });

      container.querySelectorAll('[data-resize-fit]').forEach(btn => {
        btn.addEventListener('click', () => {
          const fit = btn.dataset.resizeFit;
          const canvasW = canvas.getWidth();
          const canvasH = canvas.getHeight();
          if (fit === 'width') {
            const scale = canvasW / (obj.width || 1);
            obj.set('scaleX', scale).set('scaleY', scale);
          } else if (fit === 'height') {
            const scale = canvasH / (obj.height || 1);
            obj.set('scaleX', scale).set('scaleY', scale);
          }
          obj.setCoords();
          canvas.requestRenderAll();
          renderPropsPanel(obj);
          if (typeof saveState === 'function') saveState();
        });
      });
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   FASE 4 — SHAPE PICKER
   ══════════════════════════════════════════════════════════════ */

function shapePickerHTML() {
  const svgs = {
    rect:     '<rect x="4" y="8" width="20" height="14" rx="2" fill="currentColor"/>',
    circle:   '<circle cx="14" cy="14" r="10" fill="currentColor"/>',
    triangle: '<polygon points="14,4 26,24 2,24" fill="currentColor"/>',
    line:     '<line x1="3" y1="24" x2="25" y2="4" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    arrow:    '<polygon points="2,11 17,11 17,6 26,14 17,22 17,17 2,17" fill="currentColor"/>',
    star:     '<polygon points="14,3 17,11 26,11 18,17 21,25 14,20 7,25 10,17 2,11 11,11" fill="currentColor"/>',
  };
  const items = SHAPE_TYPES.map(s => `
    <button class="shape-pick ${state.shapeType === s.id ? 'active' : ''}" data-shape="${s.id}" title="${s.label}">
      <svg viewBox="0 0 28 28" width="28" height="28">${svgs[s.id]}</svg>
      <span>${s.label}</span>
    </button>
  `).join('');

  return `
    <div class="prop-section">
      <div class="prop-section-title">Elige una forma</div>
      <p class="hint-text">Selecciona un tipo y haz clic en el lienzo para crearla.</p>
      <div class="shape-grid">${items}</div>
    </div>
  `;
}

function bindShapePickerEvents() {
  $$('.shape-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      state.shapeType = btn.dataset.shape;
      $$('.shape-pick').forEach(b => b.classList.toggle('active', b === btn));
      status(`Forma seleccionada: ${btn.dataset.shape}`);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   FASE 4 — SHAPE PROPERTIES
   ══════════════════════════════════════════════════════════════ */

function shapePropsHTML(obj) {
  const fill = toHex(obj.fill || '#667eea');
  const stroke = toHex(obj.stroke || '#0f172a');
  const strokeW = obj.strokeWidth || 0;
  const rx = obj.rx || 0;
  const opacity = Math.round((obj.opacity ?? 1) * 100);
  const isRect = obj.type === 'rect';
  const isLine = obj.type === 'line';

  return `
    <div class="prop-section">
      <div class="prop-section-title">Forma — ${esc(obj.type)}</div>

      ${!isLine ? `
      <div class="prop-field">
        <label>Relleno</label>
        <div class="color-input-wrap">
          <input type="color" class="prop-color" data-prop="fill" value="${fill}">
          <input type="text" class="prop-hex" data-prop="fill" value="${fill}" maxlength="7" spellcheck="false">
        </div>
      </div>
      ` : ''}

      <div class="prop-field">
        <label>${isLine ? 'Color de linea' : 'Borde'}</label>
        <div class="color-input-wrap">
          <input type="color" class="prop-color" data-prop="stroke" value="${stroke}">
          <input type="text" class="prop-hex" data-prop="stroke" value="${stroke}" maxlength="7" spellcheck="false">
        </div>
      </div>

      <div class="prop-field">
        <label>${isLine ? 'Grosor' : 'Grosor del borde'} <span class="range-val" data-out="strokeWidth">${strokeW}</span></label>
        <input type="range" class="prop-range" data-prop="strokeWidth" min="0" max="60" step="1" value="${strokeW}">
      </div>

      ${isRect ? `
      <div class="prop-field">
        <label>Redondeo <span class="range-val" data-out="rx">${rx}</span></label>
        <input type="range" class="prop-range" data-prop="rx" min="0" max="200" step="2" value="${rx}">
      </div>
      ` : ''}
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Apariencia</div>
      <div class="prop-field">
        <label>Opacidad <span class="range-val" data-out="opacity">${opacity}%</span></label>
        <input type="range" class="prop-range-pct" data-prop="opacity" min="0" max="100" step="1" value="${opacity}">
      </div>
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Acciones</div>
      <div class="action-row">
        <button class="action-btn" data-action="duplicate">Duplicar</button>
        <button class="action-btn action-danger" data-action="delete">Eliminar</button>
      </div>
    </div>
  `;
}

/* ══════════════════════════════════════════════════════════════
   FASE 4 — BACKGROUND PANEL
   ══════════════════════════════════════════════════════════════ */

function backgroundPanelHTML() {
  const presets = BG_PRESETS.map(p => `
    <button class="bg-swatch" data-bg-color="${p.color}" title="${p.name}" style="background:${p.color}"></button>
  `).join('');

  const gradients = BG_GRADIENTS.map(g => `
    <button class="bg-gradient" data-c1="${g.c1}" data-c2="${g.c2}" title="${g.name}" style="background:linear-gradient(135deg, ${g.c1}, ${g.c2})">
      <span>${g.name}</span>
    </button>
  `).join('');

  return `
    <div class="prop-section">
      <div class="prop-section-title">Colores del fondo</div>
      <div class="bg-swatch-grid">${presets}</div>
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Color personalizado</div>
      <div class="prop-field">
        <div class="color-input-wrap">
          <input type="color" class="prop-color" id="bgCustomColor" value="#ffffff">
          <input type="text" class="prop-hex" id="bgCustomHex" value="#ffffff" maxlength="7" spellcheck="false">
        </div>
        <button class="action-btn" id="bgApplyCustom" style="width:100%; margin-top:8px">Aplicar color</button>
      </div>
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Gradientes <span class="section-badge-pro">Pro</span></div>
      <div class="bg-gradient-grid">${gradients}</div>
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Imagen de fondo</div>
      <button class="action-btn" id="bgUploadImg" style="width:100%">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        Subir imagen
      </button>
    </div>

    ${typeof fondoAvanzadoHTML === 'function' ? fondoAvanzadoHTML() : ''}

    <div class="prop-section">
      <div class="prop-section-title">Restablecer</div>
      <button class="action-btn action-danger" id="bgClear" style="width:100%">Quitar fondo (transparente)</button>
    </div>
  `;
}

function bindBackgroundEvents() {
  $$('.bg-swatch').forEach(btn => {
    btn.addEventListener('click', () => setCanvasBgColor(btn.dataset.bgColor));
  });

  $$('.bg-gradient').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isPro()) {
        if (typeof showUpgradeModal === 'function') showUpgradeModal('gradientes');
        else alert('Los fondos con gradientes son Pro');
        return;
      }
      setCanvasBgGradient(btn.dataset.c1, btn.dataset.c2, 135);
    });
  });

  const customColor = $('#bgCustomColor');
  const customHex   = $('#bgCustomHex');
  customColor?.addEventListener('input', () => { if (customHex) customHex.value = customColor.value; });
  customHex?.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(customHex.value) && customColor) customColor.value = customHex.value;
  });
  $('#bgApplyCustom')?.addEventListener('click', () => {
    setCanvasBgColor(customColor?.value || '#ffffff');
  });

  $('#bgUploadImg')?.addEventListener('click', uploadBgImage);
  $('#bgClear')?.addEventListener('click', clearCanvasBg);

  // Brillo, contraste y degradado propio (fondo-avanzado.js)
  if (typeof bindFondoAvanzado === 'function') bindFondoAvanzado();
}

/* ══════════════════════════════════════════════════════════════
   FASE 6 — LAYERS PANEL
   ══════════════════════════════════════════════════════════════ */

const _svgEye  = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const _svgEyeOff = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
const _svgLock = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
const _svgTrash = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>';

function getLayerName(obj) {
  if (obj.meta?.layerName) return obj.meta.layerName;
  if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
    const txt = (obj.text || '').replace(/\n/g, ' ').trim();
    return txt.length > 22 ? txt.substring(0, 22) + '...' : txt || 'Texto';
  }
  if (obj.type === 'image') return obj.meta?.name || 'Imagen';
  if (obj.type === 'rect') return 'Rectangulo';
  if (obj.type === 'circle') return 'Circulo';
  if (obj.type === 'triangle') return 'Triangulo';
  if (obj.type === 'line') return 'Linea';
  if (obj.type === 'polygon') return 'Forma';
  if (obj.type === 'group') return obj.meta?.name || 'Icono';
  if (obj.type === 'path') return 'Trazo';
  return obj.type || 'Elemento';
}

function getLayerTypeSVG(obj) {
  if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox')
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>';
  if (obj.type === 'image')
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
  if (obj.type === 'rect')
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
  if (obj.type === 'circle')
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
  if (obj.type === 'triangle')
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,4 22,20 2,20"/></svg>';
  if (obj.type === 'group')
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
}

function renderLayersPanel() {
  const container = $('#panelLayers');
  if (!container) return;

  const objects = canvas.getObjects();
  const activeObj = canvas.getActiveObject();

  if (objects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        <p>Sin capas aun. Agrega texto, imagenes o formas.</p>
      </div>`;
    return;
  }

  const reversed = objects.slice().reverse();
  const items = reversed.map((obj, i) => {
    const realIdx = objects.length - 1 - i;
    const isActive = obj === activeObj;
    const isVisible = obj.visible !== false;
    const isLocked = !!obj.lockMovementX;
    const name = getLayerName(obj);
    const icon = getLayerTypeSVG(obj);

    return `
      <div class="layer-item ${isActive ? 'active' : ''} ${!isVisible ? 'dim' : ''}" data-idx="${realIdx}" draggable="true">
        <div class="layer-grip" title="Arrastrar para reordenar">&#x2630;</div>
        <div class="layer-type-icon">${icon}</div>
        <span class="layer-name" title="${esc(name)}">${esc(name)}</span>
        <div class="layer-actions">
          <button class="layer-btn ${isVisible ? '' : 'off'}" data-layer-action="visibility" data-idx="${realIdx}" title="${isVisible ? 'Ocultar' : 'Mostrar'}">
            ${isVisible ? _svgEye : _svgEyeOff}
          </button>
          <button class="layer-btn ${isLocked ? 'active' : ''}" data-layer-action="lock" data-idx="${realIdx}" title="${isLocked ? 'Desbloquear' : 'Bloquear'}">
            ${_svgLock}
          </button>
          <button class="layer-btn layer-btn-del" data-layer-action="delete" data-idx="${realIdx}" title="Eliminar">
            ${_svgTrash}
          </button>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `<div class="layers-list">${items}</div>`;
  bindLayersEvents();
}

function bindLayersEvents() {
  const container = $('#panelLayers');
  if (!container) return;

  container.querySelectorAll('.layer-item').forEach(item => {
    // Click → seleccionar en canvas
    item.addEventListener('click', (e) => {
      if (e.target.closest('.layer-btn')) return;
      const idx = parseInt(item.dataset.idx);
      const obj = canvas.getObjects()[idx];
      if (obj && obj.selectable !== false) {
        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
        renderPropsPanel(obj);
      }
    });

    // Drag & drop reorder
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.dataset.idx);
      item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      container.querySelectorAll('.layer-item').forEach(i => i.classList.remove('drag-over'));
    });
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      container.querySelectorAll('.layer-item').forEach(i => i.classList.remove('drag-over'));
      item.classList.add('drag-over');
    });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      const fromCanvas = parseInt(e.dataTransfer.getData('text/plain'));
      const toCanvas = parseInt(item.dataset.idx);
      if (fromCanvas === toCanvas || isNaN(fromCanvas) || isNaN(toCanvas)) return;
      const obj = canvas.getObjects()[fromCanvas];
      if (!obj) return;
      canvas.moveTo(obj, toCanvas);
      canvas.requestRenderAll();
      renderLayersPanel();
    });
  });

  // Action buttons
  container.querySelectorAll('[data-layer-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.layerAction;
      const idx = parseInt(btn.dataset.idx);
      const obj = canvas.getObjects()[idx];
      if (!obj) return;

      if (action === 'visibility') {
        obj.set('visible', obj.visible === false ? true : false);
        canvas.requestRenderAll();
        renderLayersPanel();
      } else if (action === 'lock') {
        const locked = !obj.lockMovementX;
        obj.set({
          lockMovementX: locked, lockMovementY: locked,
          lockRotation: locked, lockScalingX: locked, lockScalingY: locked,
          selectable: !locked, evented: !locked,
        });
        if (locked) {
          canvas.discardActiveObject();
          renderPropsPanel(null);
        }
        canvas.requestRenderAll();
        renderLayersPanel();
      } else if (action === 'delete') {
        canvas.remove(obj);
        if (canvas.getActiveObject() === obj) {
          canvas.discardActiveObject();
          renderPropsPanel(null);
        }
        canvas.requestRenderAll();
        renderLayersPanel();
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   FASE 5 — ICON PICKER
   ══════════════════════════════════════════════════════════════ */

function iconPickerHTML(filter = '') {
  const filtered = filter
    ? ICONS.filter(ic => ic.name.toLowerCase().includes(filter) || ic.tags.some(t => t.includes(filter)))
    : ICONS;

  const items = filtered.map((ic, i) => `
    <button class="icon-pick" data-icon-idx="${ICONS.indexOf(ic)}" title="${ic.name}">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ic.svg}</svg>
    </button>
  `).join('');

  return `
    <div class="prop-section" style="padding-bottom:8px">
      <div class="prop-section-title">Iconos</div>
      <div class="prop-field">
        <input type="text" class="prop-input" id="iconSearch" placeholder="Buscar icono..." value="${esc(filter)}" spellcheck="false" autofocus>
      </div>
      <p class="hint-text">${filtered.length} iconos disponibles. Haz clic para agregar al lienzo.</p>
    </div>
    <div class="icon-grid">${items}</div>
    ${filtered.length === 0 ? '<div class="empty-state" style="padding:24px"><p>Sin resultados para esa busqueda.</p></div>' : ''}
  `;
}

function bindIconPickerEvents() {
  const container = $('#panelProps');
  if (!container) return;

  $$('.icon-pick', container).forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.iconIdx);
      if (ICONS[idx]) addIcon(ICONS[idx]);
    });
  });

  const search = $('#iconSearch');
  if (search) {
    search.addEventListener('input', () => {
      const val = search.value.toLowerCase().trim();
      container.innerHTML = iconPickerHTML(val);
      bindIconPickerEvents();
      const newSearch = $('#iconSearch');
      if (newSearch) {
        newSearch.focus();
        newSearch.setSelectionRange(val.length, val.length);
      }
    });
  }
}

/* ══════════════════════════════════════════════════════════════
   FASE 7 — TEMPLATE PICKER
   ══════════════════════════════════════════════════════════════ */

function templatePickerHTML() {
  const locked = !hasPlantillasAccess();
  const lockIcon = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

  // El catalogo completo ya NO se lista aqui: eso es el modal (tpl-modal.js),
  // donde primero escoges tu rubro. En el panel solo queda el boton para
  // abrirlo, la plantilla activa y tus plantillas guardadas.
  const iconoRejilla = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
  const botonModal = `
    <button class="action-btn action-primary" id="tplAbrirModal" style="width:100%;margin-top:10px">
      ${iconoRejilla}
      Ver plantillas por rubro
    </button>`;

  const upgradeBanner = locked ? `
    <div class="prop-section upgrade-banner">
      <div class="prop-section-title">Plan Prueba Gratis</div>
      <p class="hint-text">Las plantillas estan disponibles solo en <strong>Pro $9.99/mes</strong> o <strong>Anual $48</strong>.</p>
      <button class="action-btn action-primary" id="tplUpgradeBtn" style="width:100%">
        ${lockIcon}
        Desbloquear plantillas
      </button>
    </div>
  ` : '';

  const activeTpl = TEMPLATES.find(t => t.id === state.currentTemplate);
  const poolSize = activeTpl && TEMPLATE_VARIANTS[activeTpl.id] ? TEMPLATE_VARIANTS[activeTpl.id].length : 0;

  const headerText = activeTpl
    ? `<p class="hint-text"><strong>${esc(activeTpl.name)}</strong> activa${poolSize ? ` — vuelve a escogerla para rotar entre ${poolSize} variantes` : ''}.</p>`
    : `<p class="hint-text">Escoge tu rubro y te muestro solo las plantillas que te sirven.</p>`;

  // Seccion "Mis plantillas" (my-templates.js)
  const misPlantillas = typeof myTemplatesSectionHTML === 'function' ? myTemplatesSectionHTML() : '';

  return `
    <div class="prop-section">
      <div class="prop-section-title">Plantillas</div>
      ${headerText}
      ${botonModal}
    </div>
    ${misPlantillas}
    ${upgradeBanner}
  `;
}

const UPGRADE_COPY = {
  plantillas: {
    title: 'Desbloquea las plantillas',
    body: 'Las plantillas estan disponibles solo para usuarios <strong>Pro</strong>. En tu plan de prueba gratis puedes seguir usando Texto, Imagen, Formas, Iconos y Fondo sin limites.',
  },
  formato: {
    title: 'Formato exclusivo Pro',
    body: 'El formato <strong>Story</strong>, <strong>LinkedIn</strong> y <strong>X / Twitter</strong> son exclusivos del plan Pro. En prueba gratis solo tienes disponibles <strong>Post 1:1</strong> y <strong>Facebook</strong>.',
  },
  descargas: {
    title: 'Limite de descargas alcanzado',
    body: 'El plan Prueba Gratis permite solo <strong>3 descargas en total</strong>. Para seguir exportando sin limites, activa el plan Pro.',
  },
  guardar: {
    title: 'Guardar proyectos es Pro',
    body: 'En el plan Prueba Gratis no puedes guardar proyectos. Upgrade a Pro y conserva todos tus disenos para seguir editandolos cuando quieras.',
  },
};

// LEGACY — el showUpgradeModal real lo provee js/upgrade.js (modal con pago real).
// Se mantiene este builder por si upgrade.js no carga, pero el window.showUpgradeModal
// definido en upgrade.js tiene prioridad.
function _legacyShowUpgradeModal(feature = 'plantillas') {
  const copy = UPGRADE_COPY[feature] || UPGRADE_COPY.plantillas;
  const existing = document.getElementById('legacyUpgradeModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'upgradeModal';
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" aria-label="Cerrar">&times;</button>
      <h3>${copy.title}</h3>
      <p>${copy.body}</p>
      <div class="plan-grid">
        <div class="plan-card">
          <div class="plan-name">Pro Mensual</div>
          <div class="plan-price">$9.99<span>/mes</span></div>
          <ul>
            <li>Todas las plantillas</li>
            <li>Export PNG/SVG HD</li>
            <li>Sin marca de agua</li>
          </ul>
        </div>
        <div class="plan-card plan-featured">
          <div class="plan-badge">50% OFF</div>
          <div class="plan-name">Anual</div>
          <div class="plan-price">$48<span>/ano</span></div>
          <ul>
            <li>Todo lo de Pro</li>
            <li>Ahorra 50%</li>
            <li>Asesoria personalizada</li>
          </ul>
        </div>
      </div>
      <div class="modal-actions">
        <button class="action-btn" id="upgradeCancelBtn">Seguir en prueba gratis</button>
        <button class="action-btn action-primary" id="upgradeContactBtn">Contactar para pagar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelector('#upgradeCancelBtn').addEventListener('click', close);
  modal.querySelector('#upgradeContactBtn').addEventListener('click', () => {
    window.open('https://wa.me/584242395371?text=Hola%20quiero%20activar%20plan%20Pro%20de%20codeateJD%20Studio', '_blank');
    close();
  });
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
}

function bindTemplatePickerEvents() {
  const locked = !hasPlantillasAccess();

  const refreshPicker = () => {
    const container = $('#panelProps');
    if (container) {
      container.innerHTML = templatePickerHTML();
      bindTemplatePickerEvents();
    }
  };

  $$('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      if (locked) {
        showUpgradeModal();
        return;
      }
      const id = card.dataset.tplId;
      const sameTheme = state.currentTemplate === id;

      if (!sameTheme && canvas.getObjects().length > 0) {
        if (!confirm('Esto reemplazara el contenido actual del lienzo. ¿Continuar?')) return;
      }

      if (sameTheme) {
        // Mismo tema: solo rota a otra variante sin reconstruir el canvas.
        randomizeTemplateTitle();
        refreshPicker();
      } else {
        // Tema nuevo: reconstruye el canvas y mantiene el picker visible.
        loadTemplate(id, refreshPicker);
      }
    });
  });

  $('#tplUpgradeBtn')?.addEventListener('click', showUpgradeModal);

  $('#tplAbrirModal')?.addEventListener('click', () => {
    if (typeof openTemplateModal === 'function') openTemplateModal();
  });

  if (typeof bindMyTemplatesEvents === 'function') bindMyTemplatesEvents(refreshPicker);
}
