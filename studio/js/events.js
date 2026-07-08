/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — events.js
   Eventos del canvas + atajos de teclado + historial undo/redo
   ═══════════════════════════════════════════════════════════════ */

/* ══════════ UNDO / REDO (Fase 8) ══════════ */
const history = {
  undoStack: [],
  redoStack: [],
  isRestoring: false,
  maxSteps: 50,
};

function saveState() {
  if (history.isRestoring) return;
  const json = JSON.stringify(canvas.toJSON(['meta','selectable','evented','lockMovementX','lockMovementY','lockRotation','lockScalingX','lockScalingY']));
  history.undoStack.push(json);
  if (history.undoStack.length > history.maxSteps) history.undoStack.shift();
  history.redoStack = [];
  updateUndoRedoBtns();
}

function undo() {
  if (history.undoStack.length === 0) return;
  history.isRestoring = true;
  const currentJson = JSON.stringify(canvas.toJSON(['meta','selectable','evented','lockMovementX','lockMovementY','lockRotation','lockScalingX','lockScalingY']));
  history.redoStack.push(currentJson);
  const prev = history.undoStack.pop();
  canvas.loadFromJSON(prev, () => {
    canvas.requestRenderAll();
    history.isRestoring = false;
    updateUndoRedoBtns();
    renderLayersPanel();
    renderPropsPanel(null);
    status('Deshacer');
  });
}

function redo() {
  if (history.redoStack.length === 0) return;
  history.isRestoring = true;
  const currentJson = JSON.stringify(canvas.toJSON(['meta','selectable','evented','lockMovementX','lockMovementY','lockRotation','lockScalingX','lockScalingY']));
  history.undoStack.push(currentJson);
  const next = history.redoStack.pop();
  canvas.loadFromJSON(next, () => {
    canvas.requestRenderAll();
    history.isRestoring = false;
    updateUndoRedoBtns();
    renderLayersPanel();
    renderPropsPanel(null);
    status('Rehacer');
  });
}

function updateUndoRedoBtns() {
  const undoBtn = $('#undoBtn');
  const redoBtn = $('#redoBtn');
  if (undoBtn) undoBtn.disabled = history.undoStack.length === 0;
  if (redoBtn) redoBtn.disabled = history.redoStack.length === 0;
}

/* ══════════ CANVAS EVENTS ══════════ */
canvas.on('selection:created', () => {
  const active = canvas.getActiveObject();
  renderPropsPanel(active);
  renderLayersPanel();
  if (active) {
    const bb = active.getBoundingRect(true);
    status(`${active.type} — ${Math.round(bb.width)} x ${Math.round(bb.height)} px`);
  }
});
canvas.on('selection:updated', () => {
  renderPropsPanel(canvas.getActiveObject());
  renderLayersPanel();
});
canvas.on('selection:cleared', () => {
  renderPropsPanel(null);
  renderLayersPanel();
  status('Listo');
});
canvas.on('object:added', () => {
  saveState();
  renderLayersPanel();
});
canvas.on('object:removed', () => {
  saveState();
  renderLayersPanel();
});
canvas.on('object:modified', () => {
  saveState();
  renderLayersPanel();
});

/* ══════════ SNAP / ALIGNMENT GUIDES (Fase 10) ══════════ */
const SNAP_THRESHOLD = 8;

function clearGuides() {
  document.querySelectorAll('.snap-guide-v, .snap-guide-h').forEach(g => g.remove());
}

function showGuide(axis, pos) {
  const wrapper = $('#canvasWrapper');
  if (!wrapper) return;
  const div = document.createElement('div');
  div.className = axis === 'v' ? 'snap-guide-v' : 'snap-guide-h';
  if (axis === 'v') div.style.left = (pos * state.zoom) + 'px';
  else div.style.top = (pos * state.zoom) + 'px';
  wrapper.appendChild(div);
}

canvas.on('object:moving', (e) => {
  clearGuides();
  const obj = e.target;
  const f = FORMATS[state.format];
  const cx = f.w / 2;
  const cy = f.h / 2;
  const center = obj.getCenterPoint();

  // Snap to canvas center X
  if (Math.abs(center.x - cx) < SNAP_THRESHOLD) {
    obj.set('left', obj.left + (cx - center.x));
    showGuide('v', cx);
  }
  // Snap to canvas center Y
  if (Math.abs(center.y - cy) < SNAP_THRESHOLD) {
    obj.set('top', obj.top + (cy - center.y));
    showGuide('h', cy);
  }

  // Snap to edges (60px margin)
  const bb = obj.getBoundingRect(true);
  if (Math.abs(bb.left - 60) < SNAP_THRESHOLD) {
    obj.set('left', obj.left + (60 - bb.left));
    showGuide('v', 60);
  } else if (Math.abs(bb.left + bb.width - (f.w - 60)) < SNAP_THRESHOLD) {
    obj.set('left', obj.left + ((f.w - 60) - (bb.left + bb.width)));
    showGuide('v', f.w - 60);
  }
  if (Math.abs(bb.top - 60) < SNAP_THRESHOLD) {
    obj.set('top', obj.top + (60 - bb.top));
    showGuide('h', 60);
  } else if (Math.abs(bb.top + bb.height - (f.h - 60)) < SNAP_THRESHOLD) {
    obj.set('top', obj.top + ((f.h - 60) - (bb.top + bb.height)));
    showGuide('h', f.h - 60);
  }

  // Update status with position
  const c2 = obj.getCenterPoint();
  $('#statusCenter').textContent = `X: ${Math.round(c2.x)}  Y: ${Math.round(c2.y)}  —  ${f.label}`;
});

canvas.on('mouse:up', () => {
  clearGuides();
  updateCenterStatus();
});

canvas.on('mouse:down', (opt) => {
  if (opt.target) return;
  const p = canvas.getPointer(opt.e);
  if (state.tool === 'text') {
    addTextAt(p.x, p.y);
  } else if (state.tool === 'shape') {
    addShape(state.shapeType, p.x, p.y);
  }
});

/* ══════════ MOUSE WHEEL ZOOM ══════════ */
function bindWheelZoom() {
  const area = $('#canvasArea');
  if (!area) return;
  area.addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoomBy(e.deltaY > 0 ? 0.9 : 1.1);
  }, { passive: false });
}

/* ══════════ KEYBOARD SHORTCUTS ══════════ */
function bindShortcuts() {
  document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName;
    const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (inInput) return;

    const active = canvas.getActiveObject();
    const isEditingText = active && active.isEditing;

    // Undo / Redo (funciona siempre, incluso editando texto)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && ((e.key === 'y' || e.key === 'Y') || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
      e.preventDefault();
      redo();
      return;
    }

    if (isEditingText) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        active.set('fontWeight', Number(active.fontWeight) >= 700 ? 400 : 700);
        reflowText(active);
        canvas.requestRenderAll();
        renderPropsPanel(active);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        active.set('fontStyle', active.fontStyle === 'italic' ? 'normal' : 'italic');
        reflowText(active);
        canvas.requestRenderAll();
        renderPropsPanel(active);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        active.set('underline', !active.underline);
        canvas.requestRenderAll();
        renderPropsPanel(active);
      }
      return;
    }

    // Shortcuts help
    if (e.key === '?' || e.key === 'F1') {
      e.preventDefault();
      showShortcutsModal();
      return;
    }

    // Herramientas
    if (e.key === 'v' || e.key === 'V') setTool('select');
    if (e.key === 't' || e.key === 'T') setTool('text');
    if (e.key === 'i' || e.key === 'I') { setTool('icon'); return; }
    if (e.key === 'r' || e.key === 'R') setTool('shape');

    // Escape — deseleccionar
    if (e.key === 'Escape') {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      renderPropsPanel(null);
      setTool('select');
    }

    // Ctrl+A — seleccionar todo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      canvas.discardActiveObject();
      const sel = new fabric.ActiveSelection(canvas.getObjects(), { canvas });
      canvas.setActiveObject(sel);
      canvas.requestRenderAll();
    }

    // Delete / Backspace
    if ((e.key === 'Delete' || e.key === 'Backspace') && active) {
      e.preventDefault();
      if (active.type === 'activeSelection') {
        active.forEachObject(o => canvas.remove(o));
        canvas.discardActiveObject();
      } else {
        canvas.remove(active);
        canvas.discardActiveObject();
      }
      canvas.requestRenderAll();
      renderPropsPanel(null);
    }

    // Ctrl+D duplicar
    if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D') && active) {
      e.preventDefault();
      active.clone(cl => {
        cl.set({ left: (active.left || 0) + 20, top: (active.top || 0) + 20 });
        canvas.add(cl);
        canvas.setActiveObject(cl);
        canvas.requestRenderAll();
      });
    }

    // Zoom
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
      e.preventDefault();
      fitCanvasToView();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      zoomBy(1.25);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      zoomBy(0.8);
    }

    // Flechas para mover
    if (active && !isEditingText && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowUp')    active.top  = (active.top  || 0) - step;
      if (e.key === 'ArrowDown')  active.top  = (active.top  || 0) + step;
      if (e.key === 'ArrowLeft')  active.left = (active.left || 0) - step;
      if (e.key === 'ArrowRight') active.left = (active.left || 0) + step;
      active.setCoords();
      canvas.requestRenderAll();
    }
  });
}

/* ══════════ UI BINDINGS ══════════ */
function bindUI() {
  $$('.format-switcher button').forEach(b => {
    b.addEventListener('click', () => setFormat(b.dataset.format));
  });

  $$('.tool').forEach(t => {
    t.addEventListener('click', () => {
      const tool = t.dataset.tool;
      if (tool === 'image') {
        uploadImage();
        return;
      }
      if (tool === 'icon') {
        setTool('icon');
        return;
      }
      setTool(tool);
    });
  });

  $('#zoomIn')?.addEventListener('click', () => zoomBy(1.25));
  $('#zoomOut')?.addEventListener('click', () => zoomBy(0.8));
  $('#fitBtn')?.addEventListener('click', fitCanvasToView);

  $$('.panel-tab').forEach(t => {
    t.addEventListener('click', () => setPanel(t.dataset.panel));
  });

  // Export modal
  $('#exportBtn')?.addEventListener('click', showExportModal);

  // Undo / Redo
  $('#undoBtn')?.addEventListener('click', undo);
  $('#redoBtn')?.addEventListener('click', redo);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitCanvasToView, 120);
  });

  bindWheelZoom();
  bindShortcuts();
}
