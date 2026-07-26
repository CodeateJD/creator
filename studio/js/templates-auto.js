/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — templates-auto.js
   Plantillas del rubro "Concesionario y venta de vehiculos"

   DISEÑO: la foto va A SANGRE, ocupa la pieza entera. Encima lleva un velo
   que oscurece de la mitad hacia abajo, y sobre ese velo va todo el texto.
   Asi el carro es la pieza; el texto vive encima, no debajo en una caja.

   Cada elemento va etiquetado con el meta.role del campo que le toca en la
   ficha del rubro (ver rubros.js): modelo, detalle, precio, estado... Asi,
   cuando exista el motor de campos, ya quedan conectadas sin rehacerlas.

   Tipografia: en 1080 px el modelo ronda el 8% del ancho y el precio el 12%.
   En el telefono, mas chico no se lee.
   ═══════════════════════════════════════════════════════════════ */

/* Registro de plantillas por paquete. templates.js lo mezcla con las suyas
   en loadTemplate(), asi se pueden agregar rubros en archivos aparte.     */
window.TEMPLATE_FNS = window.TEMPLATE_FNS || {};

const AUTO_TEL = '0400-000-0000';

/* ══════════ helpers del paquete ══════════ */

/* Foto a sangre: un rectangulo que cubre todo el lienzo. El usuario le
   suelta su foto encima y ya. Debajo queda un fondo oscuro por si la borra. */
function _autoFotoSangre(borde) {
  // Sin fondo: el hueco vacio se ve TRANSPARENTE (damero), no gris. Un gris
  // parece una decision de diseno; el damero dice "aqui falta tu foto".
  if (typeof clearCanvasBg === 'function') clearCanvasBg();

  canvas.add(new fabric.Rect({
    left: 0, top: 0, width: 1080, height: 1080,
    fill: 'rgba(0,0,0,0.001)',   // casi nada, pero suficiente para poder hacerle clic
    meta: { role: 'foto' },
  }));

  // El punteado y el aviso llevan meta.avisoFoto: desaparecen solos en cuanto
  // el usuario mete su foto (foto-hueco.js).
  // Van en OSCURO: el hueco vacio se ve sobre el damero, que es claro. Si
  // fueran claros —como estaban— no se leerian.
  canvas.add(new fabric.Rect({
    left: 90, top: 210, width: 900, height: 300, rx: 20, ry: 20,
    fill: 'rgba(15,23,42,0.06)', stroke: 'rgba(30,41,59,0.55)',
    strokeWidth: 2.5, strokeDashArray: [12, 10],
    meta: { avisoFoto: true },
  }));
  canvas.add(new fabric.IText('Haz clic aqui para poner la foto del carro', {
    left: 218, top: 340, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 700, fill: '#1e293b',
    meta: { avisoFoto: true },
  }));
}

/* Velo: oscurece de la mitad hacia abajo para que el texto se lea sobre
   cualquier foto. ARRIBA va TRANSPARENTE (Jose lo pidio: la franja gris de
   antes era ese 0.62 de oscuro sobre el fondo transparente). El logo y la
   etiqueta traen su propio contraste (la etiqueta con su recuadro; el logo,
   idealmente, en PNG transparente).                                        */
function _autoVelo() {
  canvas.add(new fabric.Rect({
    left: 0, top: 0, width: 1080, height: 1080,
    // evented:false es CLAVE — el velo cubre todo el lienzo y si recibe
    // eventos se come cada clic, incluido el del hueco de la foto que esta
    // debajo. Se sigue pudiendo seleccionar desde el panel de Capas.
    evented: false, selectable: false,
    fill: new fabric.Gradient({
      type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 1080 },
      colorStops: [
        { offset: 0.00, color: 'rgba(5,12,18,0.00)' },  // arriba: transparente
        { offset: 0.16, color: 'rgba(5,12,18,0.00)' },
        { offset: 0.46, color: 'rgba(5,12,18,0.14)' },
        { offset: 0.68, color: 'rgba(5,12,18,0.82)' },
        { offset: 1.00, color: 'rgba(5,12,18,0.98)' },
      ],
    }),
  }));
}

function _autoLogo() {
  canvas.add(new fabric.IText('TU LOGO', {
    left: 56, top: 50, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 800, fill: '#ffffff', charSpacing: 110,
  }));
}

/* Etiqueta de estado, pegada arriba a la derecha */
function _autoEstado(texto, fondo, colorTexto) {
  const fs = 22;
  const w  = Math.round(texto.length * fs * 0.68) + 40;
  canvas.add(new fabric.Rect({
    left: 1024 - w, top: 42, width: w, height: 46, rx: 8, ry: 8, fill: fondo,
  }));
  canvas.add(new fabric.IText(texto, {
    left: 1024 - w + 20, top: 54, fontSize: fs, fontFamily: 'Inter',
    fontWeight: 800, fill: colorTexto, charSpacing: 50,
    meta: { role: 'estado' },
  }));
}

/* Pie: linea divisoria + renglon de contacto */
function _autoPie(texto, y, color) {
  canvas.add(new fabric.Rect({
    left: 56, top: y, width: 968, height: 1.5, fill: 'rgba(255,255,255,0.22)',
  }));
  canvas.add(new fabric.IText(texto, {
    left: 56, top: y + 16, fontSize: 25, fontFamily: 'Inter',
    fontWeight: 600, fill: color, meta: { role: 'cta' },
  }));
}

/* ══════════ 1. CARRO EN VENTA ══════════ */
window.TEMPLATE_FNS['auto-venta'] = function () {
  _autoFotoSangre('rgba(148,197,255,0.45)');
  _autoVelo();
  _autoLogo();
  _autoEstado('DISPONIBLE', '#15803d', '#dcfce7');

  canvas.add(new fabric.Textbox('Toyota Corolla S', {
    left: 56, top: 646, width: 968,
    fontSize: 88, fontFamily: 'Inter', fontWeight: 800,
    fill: '#ffffff', lineHeight: 1.0, charSpacing: -24,
    meta: { role: 'modelo' },
  }));

  canvas.add(new fabric.IText('2021  ·  32.400 km  ·  automatico', {
    left: 58, top: 764, fontSize: 27, fontFamily: 'Inter',
    fontWeight: 600, fill: '#a9b6c4', charSpacing: 20,
    meta: { role: 'detalle' },
  }));

  canvas.add(new fabric.IText('$18.900', {
    left: 52, top: 802, fontSize: 124, fontFamily: 'Inter',
    fontWeight: 900, fill: '#4ade80', charSpacing: -38,
    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.55)', blur: 18, offsetX: 0, offsetY: 4 }),
    meta: { role: 'precio' },
  }));

  canvas.add(new fabric.IText('Bs 6.898.500  ·  tasa de hoy', {
    left: 58, top: 952, fontSize: 22, fontFamily: 'Inter',
    fontWeight: 600, fill: '#8fa0b0',
  }));

  _autoPie('Escribeme  ·  wa.me/' + AUTO_TEL, 1000, '#dbe6f0');
};

/* ══════════ 2. VENDIDO ══════════ */
window.TEMPLATE_FNS['auto-vendido'] = function () {
  _autoFotoSangre('rgba(251,113,133,0.45)');
  _autoVelo();
  _autoLogo();
  _autoEstado('VENDIDO', '#991b1b', '#fecaca');

  // sello atravesado sobre la foto
  canvas.add(new fabric.Rect({
    left: 268, top: 300, width: 544, height: 122, rx: 8, ry: 8,
    fill: 'rgba(12,6,8,0.34)', stroke: '#fb7185', strokeWidth: 6, angle: -10,
  }));
  canvas.add(new fabric.IText('VENDIDO', {
    left: 322, top: 322, fontSize: 82, fontFamily: 'Inter',
    fontWeight: 900, fill: '#fb7185', charSpacing: 70, angle: -10,
  }));

  canvas.add(new fabric.Textbox('Ford Fiesta', {
    left: 56, top: 646, width: 968,
    fontSize: 88, fontFamily: 'Inter', fontWeight: 800,
    fill: '#ffffff', lineHeight: 1.0, charSpacing: -24,
    meta: { role: 'modelo' },
  }));

  canvas.add(new fabric.IText('2017  ·  118.000 km', {
    left: 58, top: 764, fontSize: 27, fontFamily: 'Inter',
    fontWeight: 600, fill: '#a9b6c4', charSpacing: 20,
    meta: { role: 'detalle' },
  }));

  canvas.add(new fabric.IText('Entregado', {
    left: 52, top: 802, fontSize: 124, fontFamily: 'Inter',
    fontWeight: 900, fill: '#fb7185', charSpacing: -38,
    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.55)', blur: 18, offsetX: 0, offsetY: 4 }),
    meta: { role: 'precio' },
  }));

  canvas.add(new fabric.IText('gracias por confiar', {
    left: 58, top: 952, fontSize: 22, fontFamily: 'Inter',
    fontWeight: 600, fill: '#c8a2a8',
  }));

  _autoPie('Tenemos 3 mas como este  ·  wa.me/' + AUTO_TEL, 1000, '#f4d8dc');
};

/* ══════════ 3. FINANCIADO / POR CUOTAS ══════════ */
window.TEMPLATE_FNS['auto-cuota'] = function () {
  _autoFotoSangre('rgba(165,180,252,0.45)');
  _autoVelo();
  _autoLogo();
  _autoEstado('FINANCIADO', '#3730a3', '#c7d2fe');

  canvas.add(new fabric.Textbox('Chevrolet Aveo', {
    left: 56, top: 552, width: 968,
    fontSize: 78, fontFamily: 'Inter', fontWeight: 800,
    fill: '#ffffff', lineHeight: 1.0, charSpacing: -22,
    meta: { role: 'modelo' },
  }));

  canvas.add(new fabric.IText('2018  ·  96.400 km  ·  sincronico', {
    left: 58, top: 656, fontSize: 26, fontFamily: 'Inter',
    fontWeight: 600, fill: '#a9b6c4', charSpacing: 20,
    meta: { role: 'detalle' },
  }));

  canvas.add(new fabric.IText('Llevatelo desde', {
    left: 58, top: 700, fontSize: 27, fontFamily: 'Inter',
    fontWeight: 600, fill: '#c7d2fe',
  }));

  const precio = new fabric.IText('$340', {
    left: 52, top: 736, fontSize: 116, fontFamily: 'Inter',
    fontWeight: 900, fill: '#a5b4fc', charSpacing: -36,
    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.55)', blur: 18, offsetX: 0, offsetY: 4 }),
    meta: { role: 'precio' },
  });
  canvas.add(precio);
  canvas.add(new fabric.IText('al mes', {
    left: 52 + precio.getBoundingRect(true, true).width + 18, top: 812,
    fontSize: 34, fontFamily: 'Inter', fontWeight: 700, fill: '#c7d2fe',
  }));

  let px = 56;
  ['Inicial 40%', '12 cuotas', 'Sin banco'].forEach(txt => {
    const fs = 21;
    const w = Math.round(txt.length * fs * 0.66) + 40;
    canvas.add(new fabric.Rect({
      left: px, top: 888, width: w, height: 48, rx: 10, ry: 10,
      fill: 'rgba(165,180,252,0.16)', stroke: 'rgba(165,180,252,0.5)', strokeWidth: 1.5,
    }));
    canvas.add(new fabric.IText(txt, {
      left: px + 20, top: 901, fontSize: fs, fontFamily: 'Inter',
      fontWeight: 700, fill: '#dbe1ff',
    }));
    px += w + 14;
  });

  _autoPie('Calcula tu cuota  ·  wa.me/' + AUTO_TEL, 1000, '#e0e7ff');
};

/* ══════════ 4. RECIEN LLEGADO ══════════ */
window.TEMPLATE_FNS['auto-nuevo'] = function () {
  _autoFotoSangre('rgba(190,242,100,0.45)');
  _autoVelo();
  _autoLogo();
  _autoEstado('RECIEN LLEGADO', '#4d7c0f', '#ecfccb');

  canvas.add(new fabric.Textbox('Toyota 4Runner', {
    left: 56, top: 632, width: 968,
    fontSize: 92, fontFamily: 'Inter', fontWeight: 800,
    fill: '#ffffff', lineHeight: 1.0, charSpacing: -26,
    meta: { role: 'modelo' },
  }));

  canvas.add(new fabric.IText('2019  ·  78.000 km  ·  4x4  ·  full equipo', {
    left: 58, top: 756, fontSize: 27, fontFamily: 'Inter',
    fontWeight: 600, fill: '#c3d69a', charSpacing: 20,
    meta: { role: 'detalle' },
  }));

  canvas.add(new fabric.IText('$34.500', {
    left: 52, top: 796, fontSize: 124, fontFamily: 'Inter',
    fontWeight: 900, fill: '#ffffff', charSpacing: -38,
    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.55)', blur: 18, offsetX: 0, offsetY: 4 }),
    meta: { role: 'precio' },
  }));

  canvas.add(new fabric.IText('recibimos tu carro en parte de pago', {
    left: 58, top: 948, fontSize: 22, fontFamily: 'Inter',
    fontWeight: 600, fill: '#a8b58c',
  }));

  _autoPie('Agenda para verlo  ·  wa.me/' + AUTO_TEL, 1000, '#e8f5cf');
};

/* ══════════ registro en el catalogo ══════════ */
(function registrarPlantillasAuto() {
  const nuevas = [
    { id: 'auto-venta',   name: 'Carro en venta', desc: 'Foto a sangre, modelo y precio grande. La de todos los dias',
      gradient: 'linear-gradient(135deg, #080f1c, #132238 60%, #4ade80)', category: 'vehiculos' },
    { id: 'auto-vendido', name: 'Vendido',        desc: 'Sello de vendido. Muestra que hay movimiento',
      gradient: 'linear-gradient(135deg, #160a0c, #3a1418 60%, #fb7185)', category: 'vehiculos' },
    { id: 'auto-cuota',   name: 'Financiado',     desc: 'Cuota mensual, inicial y condiciones',
      gradient: 'linear-gradient(135deg, #0a1020, #1b1b4d 60%, #a5b4fc)', category: 'vehiculos' },
    { id: 'auto-nuevo',   name: 'Recien llegado', desc: 'Nuevo ingreso al inventario',
      gradient: 'linear-gradient(135deg, #0d1206, #1f3a08 60%, #bef264)', category: 'vehiculos' },
  ];
  nuevas.forEach(t => { if (!TEMPLATES.some(x => x.id === t.id)) TEMPLATES.push(t); });
})();

/* ══════════ variantes: carros del mercado venezolano ══════════ */

TEMPLATE_VARIANTS['auto-venta'] = [
  { modelo: 'Toyota Corolla S',    detalle: '2021  ·  32.400 km  ·  automatico',          precio: '$18.900', estado: 'DISPONIBLE' },
  { modelo: 'Toyota 4Runner',      detalle: '2019  ·  78.000 km  ·  4x4',                 precio: '$34.500', estado: 'DISPONIBLE' },
  { modelo: 'Ford Explorer',       detalle: '2018  ·  96.200 km  ·  7 puestos',           precio: '$21.700', estado: 'DISPONIBLE' },
  { modelo: 'Jeep Grand Cherokee', detalle: '2016  ·  132.000 km  ·  blindado nivel 3',   precio: '$27.400', estado: 'DISPONIBLE' },
  { modelo: 'Hyundai Accent',      detalle: '2019  ·  54.800 km  ·  automatico',          precio: '$8.900',  estado: 'RESERVADO' },
];

TEMPLATE_VARIANTS['auto-vendido'] = [
  { modelo: 'Ford Fiesta',    detalle: '2017  ·  118.000 km', precio: 'Entregado', estado: 'VENDIDO' },
  { modelo: 'Chevrolet Aveo', detalle: '2018  ·  96.400 km',  precio: 'Entregado', estado: 'VENDIDO' },
  { modelo: 'Toyota Corolla', detalle: '2020  ·  48.000 km',  precio: 'Entregado', estado: 'VENDIDO' },
  { modelo: 'Renault Logan',  detalle: '2017  ·  87.500 km',  precio: 'Entregado', estado: 'VENDIDO' },
];

TEMPLATE_VARIANTS['auto-cuota'] = [
  { modelo: 'Chevrolet Aveo', detalle: '2018  ·  96.400 km  ·  sincronico', precio: '$340', estado: 'FINANCIADO' },
  { modelo: 'Hyundai Accent', detalle: '2019  ·  54.800 km  ·  automatico', precio: '$420', estado: 'FINANCIADO' },
  { modelo: 'Toyota Yaris',   detalle: '2020  ·  41.200 km  ·  automatico', precio: '$510', estado: 'FINANCIADO' },
  { modelo: 'Renault Logan',  detalle: '2017  ·  87.500 km  ·  sincronico', precio: '$295', estado: 'FINANCIADO' },
];

TEMPLATE_VARIANTS['auto-nuevo'] = [
  { modelo: 'Toyota 4Runner', detalle: '2019  ·  78.000 km  ·  4x4  ·  full equipo',  precio: '$34.500', estado: 'RECIEN LLEGADO' },
  { modelo: 'Mazda 3',        detalle: '2021  ·  28.900 km  ·  automatico  ·  cuero', precio: '$15.200', estado: 'RECIEN LLEGADO' },
  { modelo: 'Ford Explorer',  detalle: '2018  ·  96.200 km  ·  7 puestos',            precio: '$21.700', estado: 'RECIEN LLEGADO' },
  { modelo: 'Jeep Cherokee',  detalle: '2014  ·  158.900 km  ·  4x4',                 precio: '$9.400',  estado: 'RECIEN LLEGADO' },
];
