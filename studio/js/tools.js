/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — tools.js
   Activacion de herramientas, creacion de texto, subida de imagen
   ═══════════════════════════════════════════════════════════════ */

function setTool(tool) {
  state.tool = tool;
  $$('.tool').forEach(t => {
    t.classList.toggle('active', t.dataset.tool === tool);
  });

  if (tool === 'select') {
    canvas.defaultCursor = 'default';
    canvas.hoverCursor = 'move';
    canvas.selection = true;
  } else if (tool === 'text') {
    canvas.defaultCursor = 'text';
    canvas.hoverCursor = 'text';
    canvas.selection = false;
  } else {
    canvas.defaultCursor = 'crosshair';
    canvas.hoverCursor = 'crosshair';
    canvas.selection = false;
  }

  status(`Herramienta: ${tool}`);

  // Herramientas de creacion: deseleccionar para mostrar el picker en el panel derecho
  const pickerTools = ['shape', 'icon', 'background', 'template'];
  if (pickerTools.includes(tool) && canvas.getActiveObject()) {
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  if (typeof renderPropsPanel === 'function') {
    renderPropsPanel(canvas.getActiveObject());
  }
}

/* ══════════ TEXT ══════════ */
function addTextAt(x, y, text = 'Tu texto aqui') {
  if (!enforceLayerLimit()) return null;
  const t = new fabric.IText(text, {
    left: x,
    top: y,
    originX: 'left',
    originY: 'top',
    fontFamily: 'Inter',
    fontSize: 72,
    fontWeight: 700,
    fill: (state && state.activeColor) || '#0f172a',
    textAlign: 'left',
    lineHeight: 1.16,
    charSpacing: 0,
    padding: 4,
  });
  canvas.add(t);
  canvas.setActiveObject(t);
  canvas.requestRenderAll();
  setTool('select');
  setTimeout(() => {
    try {
      t.enterEditing();
      t.selectAll();
    } catch (_) {}
  }, 30);
  return t;
}

/* ══════════ IMAGE (Fase 3) ══════════ */
function uploadImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml';
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => addImageFromSrc(ev.target.result, file.name);
    reader.onerror = () => {
      status('Error al leer la imagen');
      alert('No se pudo leer el archivo.');
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function addImageFromSrc(src, name = 'imagen') {
  if (!enforceLayerLimit()) return;
  fabric.Image.fromURL(src, (img) => {
    if (!img) {
      status('No se pudo cargar la imagen');
      return;
    }
    const f = FORMATS[state.format];
    const maxW = f.w * 0.7;
    const maxH = f.h * 0.7;
    const scale = Math.min(maxW / img.width, maxH / img.height, 1);
    img.set({
      left: f.w / 2,
      top: f.h / 2,
      originX: 'center',
      originY: 'center',
      scaleX: scale,
      scaleY: scale,
      meta: { name },
    });
    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.requestRenderAll();
    setTool('select');
    status(`Imagen agregada: ${name}`);
  }, { crossOrigin: 'anonymous' });
}

/* ══════════ FILTERS (Fase 3) ══════════ */
function updateImageFilter(img, filterType, filterKey, value) {
  if (!img || !img.filters) img.filters = [];

  const existingIdx = img.filters.findIndex(f => f && f.type === filterType);

  if (value === 0 || value === null || value === false) {
    if (existingIdx !== -1) img.filters.splice(existingIdx, 1);
  } else {
    const FilterClass = fabric.Image.filters[filterType];
    if (!FilterClass) return;
    const opts = {};
    if (filterKey) opts[filterKey] = value;
    const f = new FilterClass(opts);
    if (existingIdx !== -1) img.filters[existingIdx] = f;
    else img.filters.push(f);
  }

  try { img.applyFilters(); } catch (e) { console.warn('applyFilters', e); }
  canvas.requestRenderAll();
}

function toggleImageEffect(img, filterType) {
  if (!img.filters) img.filters = [];

  // Convolution-based effects (Sharpen, Emboss) use Convolute with identifier
  if (filterType === 'Sharpen' || filterType === 'Emboss') {
    const idx = img.filters.findIndex(f => f && f._studioKind === filterType);
    let active;
    if (idx !== -1) {
      img.filters.splice(idx, 1);
      active = false;
    } else {
      const matrix = filterType === 'Sharpen'
        ? [ 0, -1,  0,
           -1,  5, -1,
            0, -1,  0]
        : [ 1,  1,  1,
            1,  0.7,-1,
           -1, -1, -1];
      const f = new fabric.Image.filters.Convolute({ matrix });
      f._studioKind = filterType;
      img.filters.push(f);
      active = true;
    }
    try { img.applyFilters(); } catch (e) { console.warn('applyFilters', e); }
    canvas.requestRenderAll();
    return active;
  }

  const idx = img.filters.findIndex(f => f && f.type === filterType);
  let active;
  if (idx !== -1) {
    img.filters.splice(idx, 1);
    active = false;
  } else {
    const FilterClass = fabric.Image.filters[filterType];
    if (!FilterClass) return false;
    const f = new FilterClass();
    // Set sensible defaults for filters that need params
    if (filterType === 'Pixelate') f.blocksize = 8;
    if (filterType === 'Noise') f.noise = 40;
    img.filters.push(f);
    active = true;
  }
  try { img.applyFilters(); } catch (e) { console.warn('applyFilters', e); }
  canvas.requestRenderAll();
  return active;
}

function resetImageFilters(img) {
  img.filters = [];
  try { img.applyFilters(); } catch (_) {}
  canvas.requestRenderAll();
}

/* ══════════ SHAPES (Fase 4) ══════════ */
function addShape(type, x, y) {
  if (!enforceLayerLimit()) return null;
  const size = 240;
  const common = {
    left: x, top: y,
    originX: 'center', originY: 'center',
    fill: (state && state.activeColor) || '#667eea',
    stroke: '#0f172a',
    strokeWidth: 0,
  };
  let shape;

  if (type === 'rect') {
    shape = new fabric.Rect({ ...common, width: size, height: size * 0.7, rx: 0, ry: 0 });
  } else if (type === 'circle') {
    shape = new fabric.Circle({ ...common, radius: size / 2 });
  } else if (type === 'triangle') {
    shape = new fabric.Triangle({ ...common, width: size, height: size });
  } else if (type === 'line') {
    shape = new fabric.Line(
      [x - size / 2, y, x + size / 2, y],
      { stroke: '#667eea', strokeWidth: 10, originX: 'center', originY: 'center' }
    );
  } else if (type === 'arrow') {
    shape = makeArrow(x, y, size, common);
  } else if (type === 'star') {
    shape = makeStar(x, y, 5, size / 2, size / 4, common);
  }

  if (!shape) return;
  canvas.add(shape);
  canvas.setActiveObject(shape);
  canvas.requestRenderAll();
  setTool('select');
  status(`Forma agregada: ${type}`);
}

function makeStar(cx, cy, points, outer, inner, common) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const ang = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
  }
  return new fabric.Polygon(pts, { ...common, left: cx, top: cy });
}

function makeArrow(cx, cy, size, common) {
  const w = size, h = size * 0.5;
  const pts = [
    { x: -w / 2,     y: -h / 4 },
    { x:  w / 4,     y: -h / 4 },
    { x:  w / 4,     y: -h / 2 },
    { x:  w / 2,     y:  0     },
    { x:  w / 4,     y:  h / 2 },
    { x:  w / 4,     y:  h / 4 },
    { x: -w / 2,     y:  h / 4 },
  ];
  return new fabric.Polygon(pts, { ...common, left: cx, top: cy });
}

/* ══════════ BACKGROUND (Fase 4) ══════════ */
function setCanvasBgColor(color) {
  canvas.setBackgroundImage(null, () => {
    canvas.setBackgroundColor(color, canvas.renderAll.bind(canvas));
  });
  status(`Fondo: ${color}`);
}

function setCanvasBgGradient(c1, c2, angle = 135) {
  const f = FORMATS[state.format];
  const rad = (angle * Math.PI) / 180;
  const x2 = Math.cos(rad) * f.w;
  const y2 = Math.sin(rad) * f.h;

  const grad = new fabric.Gradient({
    type: 'linear',
    coords: { x1: 0, y1: 0, x2, y2 },
    colorStops: [
      { offset: 0, color: c1 },
      { offset: 1, color: c2 },
    ],
  });
  canvas.setBackgroundImage(null, () => {
    canvas.setBackgroundColor(grad, canvas.renderAll.bind(canvas));
  });
  status(`Fondo: gradiente ${c1} → ${c2}`);
}

function setCanvasBgImage(src) {
  fabric.Image.fromURL(src, (img) => {
    if (!img) return;
    const f = FORMATS[state.format];
    const scale = Math.max(f.w / img.width, f.h / img.height);
    img.set({
      originX: 'left', originY: 'top',
      left: 0, top: 0,
      scaleX: scale, scaleY: scale,
      selectable: false, evented: false,
    });
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    status('Fondo: imagen cargada');
  }, { crossOrigin: 'anonymous' });
}

function clearCanvasBg() {
  canvas.setBackgroundImage(null, () => {
    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
  });
  status('Fondo restablecido');
}

/* ══════════ ICONS (Fase 5) ══════════ */
function addIcon(iconData) {
  if (!enforceLayerLimit()) return;
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconData.svg}</svg>`;
  fabric.loadSVGFromString(fullSvg, (objects, options) => {
    if (!objects || objects.length === 0) return;
    const group = fabric.util.groupSVGElements(objects, options);
    const f = FORMATS[state.format];
    group.set({
      left: f.w / 2,
      top: f.h / 2,
      originX: 'center',
      originY: 'center',
      scaleX: 5,
      scaleY: 5,
    });
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
    setTool('select');
    status(`Icono agregado: ${iconData.name}`);
  });
}

function uploadBgImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCanvasBgImage(ev.target.result);
    reader.readAsDataURL(file);
  };
  input.click();
}
