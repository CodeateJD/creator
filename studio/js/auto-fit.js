/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — auto-fit.js
   El texto se ajusta solo cuando cambia de variante.

   EL PROBLEMA que resuelve:
   El diseño de una plantilla se calcula con su texto por defecto. Cuando
   applyVariantToCanvas() mete el texto de otra variante, si es mas largo
   salta de linea, crece hacia abajo y se come lo que estaba debajo. Es el
   bicho que tenia "Pagina Web": el titulo montado sobre el subtitulo.

   LA SOLUCION:
   Al construir la plantilla se anota cuanto espacio ocupa cada texto con
   rol — su "presupuesto". Al cambiar de variante, si el texto nuevo no cabe,
   se le baja el tamano de fuente hasta que quepa. Nunca crece mas alla de
   lo que el diseno le reservo.

   El presupuesto de ANCHO sale de su contenedor: si el texto esta dentro de
   una caja (una pildora, un panel), el limite es esa caja. Si esta suelto,
   el limite es el borde del lienzo.
   ═══════════════════════════════════════════════════════════════ */

const AUTOFIT_MARGEN_CAJA   = 26;   // aire dentro de una pildora o panel
const AUTOFIT_MARGEN_LIENZO = 44;   // aire hasta el borde del lienzo
const AUTOFIT_MINIMO        = 0.5;  // no encoger por debajo del 50% del original

function _esTexto(o) {
  return o && (o.type === 'i-text' || o.type === 'text' || o.type === 'textbox');
}

function _contiene(caja, dentro) {
  return caja.left <= dentro.left + 2 &&
         caja.top  <= dentro.top  + 2 &&
         caja.left + caja.width  >= dentro.left + dentro.width  - 2 &&
         caja.top  + caja.height >= dentro.top  + dentro.height - 2;
}

/* Se llama una vez, justo despues de construir la plantilla y ANTES de
   aplicar ninguna variante. Anota el presupuesto de cada texto con rol.   */
function capturarPresupuestoTexto() {
  const objs = canvas.getObjects();
  const f = FORMATS[state.format];

  objs.forEach(o => {
    if (!_esTexto(o) || !o.meta || !o.meta.role) return;
    let bb;
    try { bb = o.getBoundingRect(true, true); } catch { return; }
    if (!bb || !bb.height) return;

    // ¿Esta dentro de una caja? Se busca el rectangulo mas ajustado que lo
    // contenga: esa es su pildora o su panel.
    let caja = null;
    objs.forEach(r => {
      if (r === o || r.type !== 'rect') return;
      let rb;
      try { rb = r.getBoundingRect(true, true); } catch { return; }
      if (rb.width < 30 || rb.height < 20) return;          // lineas divisorias, no
      if (rb.width > f.w * 0.98 && rb.height > f.h * 0.9) return;  // el fondo, tampoco
      if (!_contiene(rb, bb)) return;
      if (!caja || rb.width * rb.height < caja.width * caja.height) caja = rb;
    });

    o.meta.fuenteBase = o.fontSize;
    o.meta.altoBase   = Math.ceil(bb.height);
    o.meta.anchoBase  = caja
      ? Math.floor(caja.width - AUTOFIT_MARGEN_CAJA)
      : Math.floor(f.w - bb.left - AUTOFIT_MARGEN_LIENZO);
  });
}

/* Encoge el texto hasta que quepa en su presupuesto. Devuelve true si tuvo
   que tocarlo.                                                            */
function ajustarTextoAlPresupuesto(o) {
  if (!_esTexto(o) || !o.meta || !o.meta.altoBase) return false;
  if (typeof o.initDimensions !== 'function') return false;

  const base = o.meta.fuenteBase || o.fontSize;
  const min  = Math.max(11, Math.round(base * AUTOFIT_MINIMO));

  // Siempre se parte del tamano original: si no, cada cambio de variante
  // encogeria un poco mas y el texto se iria achicando sin volver nunca.
  if (o.fontSize !== base) o.set('fontSize', base);

  const medir = () => {
    try { o.initDimensions(); } catch (_) {}
    const b = o.getBoundingRect(true, true);
    return { alto: b.height, ancho: b.width };
  };

  let m = medir();
  let fs = base;
  let vueltas = 0;

  while ((m.alto > o.meta.altoBase + 2 || m.ancho > o.meta.anchoBase) &&
         fs > min && vueltas < 60) {
    fs -= 2;
    o.set('fontSize', fs);
    m = medir();
    vueltas++;
  }

  try { o.setCoords(); } catch (_) {}
  return fs !== base;
}

/* Repasa todo el lienzo. Se usa despues de aplicar una variante. */
function ajustarTodosLosTextos() {
  let tocados = 0;
  canvas.getObjects().forEach(o => { if (ajustarTextoAlPresupuesto(o)) tocados++; });
  if (tocados) canvas.requestRenderAll();
  return tocados;
}
