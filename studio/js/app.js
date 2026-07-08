/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — app.js
   Bootstrap: inicializacion del editor
   ═══════════════════════════════════════════════════════════════ */

function init() {
  bindUI();
  setFormat('post');
  refreshFormatLocks();
  updateCenterStatus();
  renderPropsPanel(null);
  renderLayersPanel();
  saveState();
  updateUndoRedoBtns();
  status('Listo');

  // Re-medir todo el texto del canvas una vez que Google Fonts haya cargado:
  // Fabric cachea metricas con fuentes fallback, dejando bounding boxes incorrectos
  // hasta que se toque la prop. Esto resuelve el problema para las fuentes display
  // (Montserrat, Poppins, Playfair, Bebas, etc).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      canvas.getObjects().forEach(o => {
        if (o && typeof o.initDimensions === 'function') {
          try { o.initDimensions(); o.setCoords(); } catch (_) {}
        }
      });
      canvas.requestRenderAll();
    });
  }
  console.log(
    '%c codeateJD Studio ',
    'background:linear-gradient(90deg,#667eea,#764ba2);color:#fff;padding:4px 10px;border-radius:4px;font-weight:bold',
    'v1.0 — Todas las fases completadas'
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
