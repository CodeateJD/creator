/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — fondo-avanzado.js
   Brillo, contraste y degradado propio para el fondo del lienzo.

   Antes solo habia 8 colores fijos, 8 degradados fijos y un color plano
   personalizado. Si querias el degradado de una plantilla en otro color,
   no habia forma.

   Ahora:
   · Degradado propio — tus dos colores y el angulo que quieras.
   · Brillo y contraste — funcionan sobre lo que haya de fondo:
       imagen    → filtros de Fabric
       color     → se le mueve la luz
       degradado → se le mueve la luz a los dos extremos
   Los deslizadores parten siempre del fondo tal como esta al abrir el
   panel, asi que se pueden subir y bajar sin que el color se degrade.
   ═══════════════════════════════════════════════════════════════ */

let _fondoBase = null;   // como estaba el fondo al abrir el panel

function _clamp01(v) { return Math.max(0, Math.min(1, v)); }

/* Mueve la luz de un color: brillo lo sube o baja, contraste lo aleja o
   acerca del gris medio.                                                  */
function _colorAjustado(hex, brillo, contraste) {
  const base = (typeof toHex === 'function' ? toHex(hex) : hex) || '#000000';
  const hsl  = _hexToHsl(base);                 // viene de edit-tools.js
  let l = hsl.l + (brillo / 100) * 0.5;
  l = 0.5 + (l - 0.5) * (1 + contraste / 100);
  return _hslToHex(hsl.h, hsl.s, _clamp01(l));
}

/* Fotografia el fondo actual para poder volver a el */
function _capturarFondoBase() {
  const img = canvas.backgroundImage;
  if (img) return { tipo: 'imagen' };

  const bg = canvas.backgroundColor;
  if (bg && typeof bg === 'object' && bg.colorStops) {
    return {
      tipo: 'degradado',
      coords: Object.assign({}, bg.coords),
      stops: bg.colorStops.map(s => ({ offset: s.offset, color: s.color })),
    };
  }
  return { tipo: 'color', color: bg || '' };
}

/* Aplica brillo y contraste sobre el fondo, partiendo siempre de la base */
function aplicarBrilloContrasteFondo(brillo, contraste) {
  if (!_fondoBase) _fondoBase = _capturarFondoBase();

  if (_fondoBase.tipo === 'imagen') {
    const img = canvas.backgroundImage;
    if (!img) return;
    img.filters = [];
    if (brillo)    img.filters.push(new fabric.Image.filters.Brightness({ brightness: brillo / 100 }));
    if (contraste) img.filters.push(new fabric.Image.filters.Contrast({ contrast: contraste / 100 }));
    img.applyFilters();
    canvas.requestRenderAll();
    return;
  }

  if (_fondoBase.tipo === 'degradado') {
    const grad = new fabric.Gradient({
      type: 'linear',
      coords: _fondoBase.coords,
      colorStops: _fondoBase.stops.map(s => ({
        offset: s.offset,
        color: _colorAjustado(s.color, brillo, contraste),
      })),
    });
    canvas.setBackgroundColor(grad, canvas.renderAll.bind(canvas));
    return;
  }

  // color plano — si no hay fondo (transparente) no hay nada que ajustar
  if (!_fondoBase.color) { status('No hay fondo que ajustar — el lienzo esta transparente'); return; }
  canvas.setBackgroundColor(
    _colorAjustado(_fondoBase.color, brillo, contraste),
    canvas.renderAll.bind(canvas)
  );
}

/* Degradado propio: dos colores y un angulo */
function aplicarDegradadoPropio(c1, c2, angulo) {
  if (typeof isPro === 'function' && !isPro()) {
    if (typeof showUpgradeModal === 'function') showUpgradeModal('gradientes');
    return false;
  }
  setCanvasBgGradient(c1, c2, angulo);
  _fondoBase = null;               // hay fondo nuevo: los deslizadores parten de cero
  const b = $('#bgBrillo'), c = $('#bgContraste');
  if (b) { b.value = 0; const o = $('[data-out="bg-brillo"]');    if (o) o.textContent = '0'; }
  if (c) { c.value = 0; const o = $('[data-out="bg-contraste"]'); if (o) o.textContent = '0'; }
  return true;
}

/* ══════════ interfaz ══════════ */

function fondoAvanzadoHTML() {
  const pro = typeof isPro === 'function' ? isPro() : true;
  return `
    <div class="prop-section">
      <div class="prop-section-title">Degradado propio ${pro ? '' : '<span class="section-badge-pro">Pro</span>'}</div>
      <div class="bgav-row">
        <div class="bgav-col">
          <label>Color 1</label>
          <input type="color" class="prop-color" id="bgGradC1" value="#0f172a">
        </div>
        <div class="bgav-col">
          <label>Color 2</label>
          <input type="color" class="prop-color" id="bgGradC2" value="#38bdf8">
        </div>
        <button class="action-btn action-primary bgav-swap" id="bgGradSwap" title="Intercambiar">⇄</button>
      </div>
      <div class="prop-field">
        <label>Angulo <span class="range-val" data-out="bg-angulo">135°</span></label>
        <input type="range" class="prop-range" id="bgGradAng" min="0" max="360" step="5" value="135">
      </div>
      <div class="bgav-preview" id="bgGradPreview"></div>
      <button class="action-btn action-primary" id="bgGradAplicar" style="width:100%;margin-top:8px">Aplicar degradado</button>
    </div>

    <div class="prop-section">
      <div class="prop-section-title">Brillo y contraste del fondo</div>
      <div class="prop-field">
        <label>Brillo <span class="range-val" data-out="bg-brillo">0</span></label>
        <input type="range" class="prop-range" id="bgBrillo" min="-100" max="100" step="1" value="0">
      </div>
      <div class="prop-field">
        <label>Contraste <span class="range-val" data-out="bg-contraste">0</span></label>
        <input type="range" class="prop-range" id="bgContraste" min="-100" max="100" step="1" value="0">
      </div>
      <button class="action-btn" id="bgAjusteReset" style="width:100%">Volver al original</button>
      <p class="hint-text">Sirve para el color, el degradado y la imagen de fondo.</p>
    </div>
  `;
}

function bindFondoAvanzado() {
  // Al abrir el panel se vuelve a fotografiar el fondo: los deslizadores
  // parten de como esta ahora, no de un estado viejo.
  _fondoBase = _capturarFondoBase();

  const c1  = $('#bgGradC1');
  const c2  = $('#bgGradC2');
  const ang = $('#bgGradAng');
  const prev = $('#bgGradPreview');

  const pintarPreview = () => {
    if (!prev || !c1 || !c2 || !ang) return;
    prev.style.background = `linear-gradient(${ang.value}deg, ${c1.value}, ${c2.value})`;
  };
  pintarPreview();

  c1?.addEventListener('input', pintarPreview);
  c2?.addEventListener('input', pintarPreview);
  ang?.addEventListener('input', () => {
    const o = $('[data-out="bg-angulo"]');
    if (o) o.textContent = ang.value + '°';
    pintarPreview();
  });

  $('#bgGradSwap')?.addEventListener('click', () => {
    if (!c1 || !c2) return;
    const t = c1.value; c1.value = c2.value; c2.value = t;
    pintarPreview();
  });

  $('#bgGradAplicar')?.addEventListener('click', () => {
    aplicarDegradadoPropio(c1?.value || '#0f172a', c2?.value || '#38bdf8',
                           parseInt(ang?.value || '135', 10));
  });

  const leer = () => ({
    b: parseFloat($('#bgBrillo')?.value || 0),
    c: parseFloat($('#bgContraste')?.value || 0),
  });

  $('#bgBrillo')?.addEventListener('input', e => {
    const o = $('[data-out="bg-brillo"]'); if (o) o.textContent = e.target.value;
    const v = leer(); aplicarBrilloContrasteFondo(v.b, v.c);
  });
  $('#bgContraste')?.addEventListener('input', e => {
    const o = $('[data-out="bg-contraste"]'); if (o) o.textContent = e.target.value;
    const v = leer(); aplicarBrilloContrasteFondo(v.b, v.c);
  });

  $('#bgAjusteReset')?.addEventListener('click', () => {
    const b = $('#bgBrillo'), c = $('#bgContraste');
    if (b) b.value = 0;
    if (c) c.value = 0;
    const ob = $('[data-out="bg-brillo"]');    if (ob) ob.textContent = '0';
    const oc = $('[data-out="bg-contraste"]'); if (oc) oc.textContent = '0';
    aplicarBrilloContrasteFondo(0, 0);
    status('Fondo devuelto a su color original');
  });
}
