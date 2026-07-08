/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — canvas.js
   Instancia Fabric + estilos de seleccion globales
   ═══════════════════════════════════════════════════════════════ */

const canvas = new fabric.Canvas('c', {
  width: FORMATS.post.w,
  height: FORMATS.post.h,
  backgroundColor: '#ffffff',
  preserveObjectStacking: true,
  selection: true,
  stopContextMenu: true,
  fireRightClick: true,
});

fabric.Object.prototype.set({
  cornerColor: '#667eea',
  cornerStrokeColor: '#ffffff',
  cornerSize: 10,
  cornerStyle: 'circle',
  transparentCorners: false,
  borderColor: '#667eea',
  borderScaleFactor: 1.5,
  padding: 2,
});
