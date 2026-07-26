/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — foto-hueco.js
   El hueco de foto de las plantillas funciona de verdad.

   EL PROBLEMA que resuelve:
   Las plantillas de catalogo traen un recuadro punteado que dice "suelta
   aqui tu foto". Pero era solo un dibujo: si el usuario subia una imagen
   por el boton Imagen, le caia encima como objeto nuevo, del tamano que
   fuera, y el punteado se quedaba ahi para borrarlo a mano. Resultado: la
   plantilla nunca se parecia al diseno, porque el diseno vive de la foto.

   AHORA:
   Clic en el hueco → selector de archivos → la foto entra recortada al
   hueco, se coloca en la misma capa, y el punteado y el aviso desaparecen.
   Tambien se puede arrastrar la foto directamente sobre el lienzo.

   Las plantillas marcan sus piezas asi:
     meta.role = 'foto'    → el hueco
     meta.avisoFoto = true → el punteado y el texto de ayuda (se borran)
   ═══════════════════════════════════════════════════════════════ */

function _huecoDeFoto() {
  return canvas.getObjects().find(o => o.meta && o.meta.role === 'foto' && o.type === 'rect');
}

function _borrarAvisosDeFoto() {
  canvas.getObjects()
    .filter(o => o.meta && o.meta.avisoFoto)
    .forEach(o => canvas.remove(o));
}

/* Mete la imagen en el hueco: la escala para CUBRIRLO (sin deformar), la
   recorta a su forma y la deja en la misma posicion de la pila.           */
function ponerFotoEnHueco(src, hueco) {
  const slot = hueco || _huecoDeFoto();
  if (!slot) { status('Esta plantilla no tiene hueco de foto'); return; }

  const caja = {
    left:   slot.left,
    top:    slot.top,
    width:  slot.width  * (slot.scaleX || 1),
    height: slot.height * (slot.scaleY || 1),
    rx:     slot.rx || 0,
  };
  const indice = canvas.getObjects().indexOf(slot);

  fabric.Image.fromURL(src, img => {
    if (!img) { status('No se pudo cargar la imagen'); return; }

    const escala = Math.max(caja.width / img.width, caja.height / img.height);
    img.set({
      originX: 'left', originY: 'top',
      left: caja.left + (caja.width  - img.width  * escala) / 2,
      top:  caja.top  + (caja.height - img.height * escala) / 2,
      scaleX: escala, scaleY: escala,
      meta: { ...(slot.meta || {}), role: 'foto' },
    });

    // Se recorta a la forma del hueco para que no se salga por los lados.
    img.clipPath = new fabric.Rect({
      left: caja.left, top: caja.top,
      width: caja.width, height: caja.height,
      rx: caja.rx, ry: caja.rx,
      originX: 'left', originY: 'top',
      absolutePositioned: true,
    });

    canvas.remove(slot);
    _borrarAvisosDeFoto();
    canvas.insertAt(img, indice, false);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();

    if (typeof saveState === 'function') saveState();
    if (typeof renderLayersPanel === 'function') renderLayersPanel();
    if (typeof renderPropsPanel === 'function') renderPropsPanel(img);
    status('Foto puesta — ajusta brillo y contraste en el panel si hace falta');
  }, { crossOrigin: 'anonymous' });
}

/* Abre el selector de archivos y mete lo que escoja en el hueco.

   IMPORTANTE: se crea el input y se hace click() SIN adjuntarlo al DOM,
   exactamente igual que uploadImage() (el boton "Imagen" que si funciona).
   La version anterior lo adjuntaba fuera de pantalla y en Chrome eso hacia
   que el dialogo NO se abriera: el status decia "Escoge la foto..." pero no
   salia ninguna ventana. Menos es mas. */
function pedirFotoParaHueco(hueco) {
  const slot = hueco || _huecoDeFoto();
  if (!slot) { status('Esta plantilla no tiene hueco de foto'); return; }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/jpg,image/webp';
  input.onchange = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => ponerFotoEnHueco(ev.target.result, slot);
    reader.onerror = () => alert('No se pudo leer el archivo.');
    reader.readAsDataURL(file);
  };

  status('Escoge la foto...');
  input.click();
}

/* ══════════ enganches ══════════ */

/* ══════════ BOTON SIEMPRE VISIBLE ══════════

   Se probo con clic sobre el lienzo y NO sirve: el velo, los avisos y el
   modo de herramienta se pelean por el evento, y termina o sin hacer nada
   o disparandose en bucle. Un boton en el panel no depende de nada de eso.

   Aparece SOLO cuando la plantilla tiene un hueco de foto vacio, y en
   cualquier estado del panel: haya algo seleccionado o no.                */

function _inyectarBotonPonerFoto() {
  const panel = document.getElementById('panelProps');
  if (!panel) return;

  const viejo = panel.querySelector('#huecoFotoAviso');
  if (viejo) viejo.remove();

  const hueco = _huecoDeFoto();
  if (!hueco) return;                       // no hay hueco vacio: nada que mostrar

  const bloque = document.createElement('div');
  bloque.className = 'prop-section hueco-foto-aviso';
  bloque.id = 'huecoFotoAviso';
  bloque.innerHTML = `
    <div class="prop-section-title">Falta la foto</div>
    <button class="action-btn action-primary" id="btnPonerFoto" style="width:100%">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      Poner la foto
    </button>
    <p class="hint-text">Tambien puedes arrastrar la foto y soltarla sobre el lienzo.</p>
  `;
  panel.insertBefore(bloque, panel.firstChild);
  // El manejador NO se pone aqui: va delegado en el documento (mas abajo).
  // Si se pusiera en el boton, cualquier repintado del panel lo dejaria
  // huerfano — que es justo lo que pasaba: el boton se veia y no hacia nada.
}

/* Delegacion: el clic se escucha en el documento, asi da igual cuantas
   veces se vuelva a pintar el panel — y funciona igual para el boton FIJO
   de la barra izquierda (#toolPonerFoto), que vive en el index.html.      */
document.addEventListener('click', e => {
  if (!e.target || !e.target.closest) return;
  const btn = e.target.closest('#btnPonerFoto, #toolPonerFoto');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();

  // Si la plantilla no tiene hueco, se comporta como el boton Imagen normal:
  // sube la imagen y la deja suelta en el lienzo.
  if (!_huecoDeFoto()) {
    if (typeof uploadImage === 'function') uploadImage();
    else status('Esta plantilla no tiene hueco de foto');
    return;
  }
  pedirFotoParaHueco();
});

/* El boton fijo se marca cuando la plantilla tiene un hueco esperando foto,
   para que se note que hace falta.                                        */
function _refrescarBotonFotoBarra() {
  const b = document.getElementById('toolPonerFoto');
  if (b) b.classList.toggle('falta-foto', !!_huecoDeFoto());
}
canvas.on('after:render', _refrescarBotonFotoBarra);

/* ══════════ CLIC EN EL HUECO = ABRIR EL SELECTOR ══════════

   El lienzo invita "Haz clic aqui para poner la foto del carro", pero ese
   clic solo SELECCIONABA el objeto y no pasaba nada: el usuario seguia al
   pie de la letra lo que el diseno le pedia y fallaba.

   Antes se descarto el clic sobre el lienzo porque un listener generico se
   peleaba con el velo y se disparaba en bucle. Este NO es generico: es UN
   solo listener de Fabric que solo actua cuando el objeto soltado es el
   hueco (meta.role==='foto') o su aviso (meta.avisoFoto). Un clic = una vez.
   Se ignora si el clic fue en realidad un arrastre (mover el hueco) o si la
   plantilla ya tiene la foto puesta.                                       */
if (!canvas.__clicHuecoMontado) {
  canvas.__clicHuecoMontado = true;
  let _downX = 0, _downY = 0, _downTool = 'select';
  canvas.on('mouse:down', opt => {
    const p = opt.pointer || {};
    _downX = p.x || 0; _downY = p.y || 0;
    _downTool = (typeof state !== 'undefined' && state.tool) || 'select';
  });
  canvas.on('mouse:up', opt => {
    // Solo en modo mover/seleccionar. Si el usuario esta colocando texto o
    // una forma, el clic sobre el hueco es para colocar ESO, no para abrir
    // el selector de foto.
    if (_downTool !== 'select') return;
    const t = opt.target;
    if (!t || !t.meta) return;
    if (t.meta.role !== 'foto' && t.meta.avisoFoto !== true) return;
    if (!_huecoDeFoto()) return;                    // ya hay foto: no molestar
    const p = opt.pointer || {};
    const movido = Math.hypot((p.x || 0) - _downX, (p.y || 0) - _downY) > 6;
    if (movido) return;                             // fue arrastre, no clic
    pedirFotoParaHueco();
  });
}

/* Se engancha al render del panel: asi el boton sale en todos los casos
   sin tener que tocar properties.js en cinco sitios distintos.

   OJO CON EL ORDEN: este archivo se carga ANTES que properties.js, asi que
   aqui renderPropsPanel todavia no existe. Hay que envolverla cuando ya
   estan todos los scripts cargados, no en el momento de leer este archivo. */
function _engancharBotonAlPanel() {
  if (typeof renderPropsPanel !== 'function' || renderPropsPanel.__conBotonFoto) return;
  const _renderOriginal = renderPropsPanel;
  renderPropsPanel = function (obj) {
    _renderOriginal(obj);
    try { _inyectarBotonPonerFoto(); } catch (_) {}
  };
  renderPropsPanel.__conBotonFoto = true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _engancharBotonAlPanel);
} else {
  _engancharBotonAlPanel();
}

/* Arrastrar una imagen desde el escritorio y soltarla sobre el lienzo */
(function engancharArrastre() {
  const zona = document.getElementById('canvasArea') || document.body;

  ['dragenter', 'dragover'].forEach(ev => {
    zona.addEventListener(ev, e => {
      if (!e.dataTransfer || !e.dataTransfer.types.includes('Files')) return;
      e.preventDefault();
      zona.classList.add('soltando-foto');
    });
  });

  ['dragleave', 'drop'].forEach(ev => {
    zona.addEventListener(ev, e => {
      if (ev === 'dragleave' && zona.contains(e.relatedTarget)) return;
      zona.classList.remove('soltando-foto');
    });
  });

  zona.addEventListener('drop', e => {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file || !/^image\//.test(file.type)) return;
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = ev => {
      const hueco = _huecoDeFoto();
      // Si la plantilla tiene hueco, la foto va ahi. Si no, se agrega suelta.
      if (hueco) ponerFotoEnHueco(ev.target.result, hueco);
      else if (typeof addImageFromSrc === 'function') addImageFromSrc(ev.target.result);
    };
    reader.readAsDataURL(file);
  });
})();

/* ══════════ el boton "Imagen" de siempre llena el hueco ══════════

   Lo mas descubrible no es un boton nuevo: es que el boton Imagen que ya
   existe haga lo correcto. Si la plantilla tiene un hueco vacio, la foto
   entra ahi; si no, se agrega suelta como antes.                          */
if (typeof addImageFromSrc === 'function') {
  const _addImagenOriginal = addImageFromSrc;
  addImageFromSrc = function (src, name) {
    const hueco = _huecoDeFoto();
    if (hueco) return ponerFotoEnHueco(src, hueco);
    return _addImagenOriginal(src, name);
  };
}

