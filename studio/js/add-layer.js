/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — add-layer.js
   Botón "+" en el panel de Capas, como en Photoshop.

   Jose lo pidió: en la pestaña CAPAS no había forma obvia de agregar una
   capa; esperaba un "+" arriba de la lista. Este agrega Texto / Imagen /
   Forma / Icono directo, sin tener que activar una herramienta y clicar el
   lienzo. (El texto, la imagen y la forma caen en el CENTRO; el icono abre
   su buscador.)

   Se engancha envolviendo renderLayersPanel (que reescribe el HTML del panel
   en cada render) y re-inyecta la barra arriba. Los clics van delegados en
   el documento para sobrevivir a los repintados — misma lección del resto.
   ═══════════════════════════════════════════════════════════════ */

/* Agrega una imagen suelta en el centro (una capa nueva de verdad, sin pasar
   por el hueco de la foto del producto). */
function _addImagenLibre() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/jpg,image/webp,image/svg+xml';
  input.onchange = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = ev => {
      fabric.Image.fromURL(ev.target.result, img => {
        if (!img) { status('No se pudo cargar la imagen'); return; }
        const f = FORMATS[state.format];
        const escala = Math.min(f.w * 0.5 / img.width, f.h * 0.5 / img.height, 1);
        img.set({
          left: f.w / 2, top: f.h / 2,
          originX: 'center', originY: 'center',
          scaleX: escala, scaleY: escala,
          meta: { name: file.name || 'imagen' },
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        if (typeof saveState === 'function') saveState();
        if (typeof renderLayersPanel === 'function') renderLayersPanel();
      }, { crossOrigin: 'anonymous' });
    };
    rd.readAsDataURL(file);
  };
  input.click();   // sin adjuntar al DOM — como uploadImage()
}

function agregarCapa(tipo) {
  const f = FORMATS[state.format];
  if (tipo === 'text') {
    if (typeof addTextAt === 'function') addTextAt(f.w * 0.2, f.h * 0.44);
  } else if (tipo === 'shape') {
    if (typeof addShape === 'function') addShape('rect', f.w / 2, f.h / 2);
  } else if (tipo === 'icon') {
    if (typeof setTool === 'function') setTool('icon');   // abre el buscador de iconos
  } else if (tipo === 'image') {
    _addImagenLibre();
  }
  if (typeof renderLayersPanel === 'function') renderLayersPanel();
}

/* Barra con el "+" arriba de la lista de capas */
function _inyectarBarraAdd() {
  const panel = document.getElementById('panelLayers');
  if (!panel || panel.querySelector('#addLayerBar')) return;
  const bar = document.createElement('div');
  bar.id = 'addLayerBar';
  bar.className = 'add-layer-bar';
  bar.innerHTML = `
    <button class="add-layer-btn" id="btnAddLayer" type="button" title="Agregar una capa">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Agregar capa
    </button>
    <div class="add-layer-menu" id="addLayerMenu" hidden>
      <button type="button" data-add="text"><b>T</b> Texto</button>
      <button type="button" data-add="image"><b>▣</b> Imagen</button>
      <button type="button" data-add="shape"><b>◼</b> Forma</button>
      <button type="button" data-add="icon"><b>✦</b> Icono</button>
    </div>`;
  panel.insertBefore(bar, panel.firstChild);
}

function _engancharAddLayer() {
  if (typeof renderLayersPanel !== 'function' || renderLayersPanel.__conAdd) return;
  const orig = renderLayersPanel;
  renderLayersPanel = function () {
    orig();
    try { _inyectarBarraAdd(); } catch (_) {}
  };
  renderLayersPanel.__conAdd = true;
  // Por si el panel de capas ya está pintado en este momento.
  try { _inyectarBarraAdd(); } catch (_) {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _engancharAddLayer);
} else {
  _engancharAddLayer();
}

/* Clics delegados: el "+" abre/cierra el menú; cada opción agrega su capa. */
if (!document.__addLayerBound) {
  document.__addLayerBound = true;
  document.addEventListener('click', e => {
    const menu = document.getElementById('addLayerMenu');
    const toggle = e.target.closest && e.target.closest('#btnAddLayer');
    if (toggle) { e.preventDefault(); if (menu) menu.hidden = !menu.hidden; return; }
    const opt = e.target.closest && e.target.closest('#addLayerMenu [data-add]');
    if (opt) { e.preventDefault(); agregarCapa(opt.getAttribute('data-add')); if (menu) menu.hidden = true; return; }
    // clic fuera → cerrar
    if (menu && !menu.hidden && !(e.target.closest && e.target.closest('#addLayerBar'))) menu.hidden = true;
  });
}
