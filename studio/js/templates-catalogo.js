/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — templates-catalogo.js
   Plantillas de los rubros de FAMILIA CATALOGO:
     · comida     — restaurante, cafe y panaderia
     · belleza    — barberia, salon y estetica
     · inmuebles  — bienes raices
     · tienda     — tienda y ropa

   En esta familia manda la FOTO y el PRECIO: pocos campos, muchas filas.
   Cada elemento lleva el meta.role del campo de su ficha (ver rubros.js).

   Nada de datos reales de codeateJD: telefono 0400-000-0000 (prefijo que no
   existe en Venezuela) y "TU LOGO".
   ═══════════════════════════════════════════════════════════════ */

window.TEMPLATE_FNS = window.TEMPLATE_FNS || {};

/* ══════════ helpers compartidos ══════════ */

const CAT_TEL = '0400-000-0000';

function _catBg(c1, c2, halo) {
  setCanvasBgGradient(c1, c2, 160);
  canvas.add(new fabric.Circle({
    left: 690, top: -230, radius: 330, fill: halo, opacity: 0.15,
  }));
}

function _catLogo(color) {
  canvas.add(new fabric.IText('TU LOGO', {
    left: 60, top: 52, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 800, fill: color || '#ffffff', charSpacing: 90,
  }));
}

// Pildora. Devuelve el ancho.
function _catPill(texto, x, y, fondo, colorTexto, rol) {
  const fs = 22;
  const w  = Math.round(texto.length * fs * 0.66) + 46;
  canvas.add(new fabric.Rect({
    left: x, top: y, width: w, height: 52, rx: 26, ry: 26, fill: fondo,
  }));
  canvas.add(new fabric.IText(texto, {
    left: x + 23, top: y + 14, fontSize: fs, fontFamily: 'Inter',
    fontWeight: 800, fill: colorTexto, charSpacing: 40,
    meta: rol ? { role: rol } : undefined,
  }));
  return w;
}

// Pildora pegada a la esquina superior derecha
function _catPillDerecha(texto, y, fondo, colorTexto, rol) {
  const w = _catPill(texto, 0, y, fondo, colorTexto, rol);
  canvas.item(canvas.size() - 2).set({ left: 1020 - w });
  canvas.item(canvas.size() - 1).set({ left: 1020 - w + 23 });
  return w;
}

function _catFoto(y, alto, borde, aviso) {
  // Hueco vacio = transparente, no gris. Ver templates-auto.js.
  canvas.add(new fabric.Rect({
    left: 60, top: y, width: 960, height: alto, rx: 22, ry: 22,
    fill: 'rgba(0,0,0,0.001)',
    stroke: borde, strokeWidth: 2.5, strokeDashArray: [10, 8],
    meta: { role: 'foto' },
  }));
  canvas.add(new fabric.IText(aviso || 'Haz clic aqui para poner tu foto', {
    left: 300, top: y + alto / 2 - 16, fontSize: 26, fontFamily: 'Inter',
    fontWeight: 700, fill: 'rgba(241,245,249,0.78)',
    meta: { avisoFoto: true },
  }));
}

function _catCta(texto, y, color) {
  canvas.add(new fabric.Rect({
    left: 60, top: y, width: 960, height: 2, fill: 'rgba(255,255,255,0.16)',
  }));
  canvas.add(new fabric.IText(texto, {
    left: 60, top: y + 24, fontSize: 28, fontFamily: 'Inter',
    fontWeight: 700, fill: color, meta: { role: 'cta' },
  }));
}

/* Bloque estandar: nombre grande + detalle + precio enorme.
   Se mide de arriba abajo para que nunca choquen.                     */
function _catBloque(nombre, detalle, precio, opts) {
  const o = opts || {};
  const yNombre  = o.y || 618;
  const fsNombre = o.fsNombre || 88;
  const altoNom  = Math.round(fsNombre * 1.18);
  const yDetalle = yNombre + altoNom + 14;
  const yPrecio  = yDetalle + 52;

  canvas.add(new fabric.Textbox(nombre, {
    left: 60, top: yNombre, width: 960,
    fontSize: fsNombre, fontFamily: 'Inter', fontWeight: 800,
    fill: '#ffffff', lineHeight: 1.02, charSpacing: -20,
    meta: { role: o.rolNombre || 'producto' },
  }));

  canvas.add(new fabric.IText(detalle, {
    left: 62, top: yDetalle, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: o.colorDetalle || '#94a3b8',
    meta: { role: o.rolDetalle || 'descripcion' },
  }));

  canvas.add(new fabric.IText(precio, {
    left: 58, top: yPrecio, fontSize: o.fsPrecio || 132, fontFamily: 'Inter',
    fontWeight: 900, fill: o.colorPrecio || '#4ade80', charSpacing: -40,
    shadow: new fabric.Shadow({ color: o.glow || 'rgba(74,222,128,0.35)', blur: 26, offsetX: 0, offsetY: 0 }),
    meta: { role: 'precio' },
  }));
  return yPrecio + Math.round((o.fsPrecio || 132) * 1.18);
}

/* ═══════════════════════════════════════════════════════════════
   COMIDA — restaurante, cafe y panaderia
   ═══════════════════════════════════════════════════════════════ */

window.TEMPLATE_FNS['food-producto'] = function () {
  _catBg('#140b06', '#3a2110', '#fbbf24');
  _catLogo();
  _catPillDerecha('HOY', 44, '#854d0e', '#fde68a', 'estado');
  _catFoto(120, 470, 'rgba(251,191,36,0.35)', 'Arrastra aqui la foto del plato');
  _catBloque('Latte', 'Espresso doble + leche vaporizada', '$3,50', {
    y: 618, colorPrecio: '#fbbf24', glow: 'rgba(251,191,36,0.35)', colorDetalle: '#d6bd94',
  });
  // La linea en bolivares va AL LADO del precio, no debajo: debajo chocaba
  // con el precio cuando la cifra tiene mas digitos.
  const precioFood = canvas.getObjects().find(o => o.meta && o.meta.role === 'precio');
  canvas.add(new fabric.IText('Bs 1.277 a la tasa de hoy', {
    left: 58 + precioFood.getBoundingRect(true, true).width + 24, top: 872,
    fontSize: 26, fontFamily: 'Inter', fontWeight: 600, fill: '#c9b18a',
  }));
  _catCta('Pidelo por WhatsApp  ·  ' + CAT_TEL, 976, '#fde68a');
};

window.TEMPLATE_FNS['food-menu'] = function () {
  _catBg('#0c1207', '#24380f', '#84cc16');
  _catLogo();
  _catPillDerecha('MENU DEL DIA', 44, '#3f6212', '#d9f99d', 'estado');

  canvas.add(new fabric.Textbox('Menu de hoy', {
    left: 60, top: 140, width: 960, fontSize: 96, fontFamily: 'Inter',
    fontWeight: 900, fill: '#ffffff', charSpacing: -24,
    meta: { role: 'producto' },
  }));
  canvas.add(new fabric.IText('Martes 12 de agosto  ·  hasta agotar', {
    left: 62, top: 262, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#bef264', meta: { role: 'descripcion' },
  }));

  // tres renglones de plato + precio
  const platos = [
    ['Pabellon criollo', '$6,00'],
    ['Pollo a la plancha', '$5,50'],
    ['Pasta en salsa rosada', '$5,00'],
  ];
  let y = 360;
  platos.forEach((p, i) => {
    canvas.add(new fabric.Rect({
      left: 60, top: y, width: 960, height: 110, rx: 16, ry: 16,
      fill: 'rgba(132,204,22,0.10)', stroke: 'rgba(132,204,22,0.34)', strokeWidth: 1.5,
    }));
    // Sin meta.role: si el primer plato llevara el rol 'producto' la variante
    // le escribiria encima el mismo texto del titulo y saldria duplicado.
    // Los platos los llenara el repetidor cuando exista el motor de campos.
    canvas.add(new fabric.IText(p[0], {
      left: 92, top: y + 32, fontSize: 44, fontFamily: 'Inter',
      fontWeight: 700, fill: '#ffffff',
    }));
    canvas.add(new fabric.IText(p[1], {
      left: 830, top: y + 28, fontSize: 50, fontFamily: 'Inter',
      fontWeight: 900, fill: '#a3e635',
    }));
    y += 128;
  });

  canvas.add(new fabric.IText('Incluye sopa y jugo natural', {
    left: 62, top: 782, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#d9f99d',
  }));
  _catCta('Reserva tu plato  ·  ' + CAT_TEL, 976, '#d9f99d');
};

window.TEMPLATE_FNS['food-promo'] = function () {
  _catBg('#170610', '#4a0d2b', '#f472b6');
  _catLogo();
  _catPillDerecha('PROMO', 44, '#9d174d', '#fbcfe8', 'estado');
  _catFoto(120, 400, 'rgba(244,114,182,0.35)', 'Arrastra aqui la foto');

  canvas.add(new fabric.Textbox('2x1 en cafe', {
    left: 60, top: 540, width: 960, fontSize: 96, fontFamily: 'Inter',
    fontWeight: 900, fill: '#ffffff', charSpacing: -24, lineHeight: 1.02,
    meta: { role: 'producto' },
  }));
  canvas.add(new fabric.IText('Todos los martes de 3 a 6 pm', {
    left: 62, top: 664, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#fbcfe8', meta: { role: 'descripcion' },
  }));

  // precio tachado + precio nuevo
  const antes = new fabric.IText('$7,00', {
    left: 60, top: 722, fontSize: 56, fontFamily: 'Inter',
    fontWeight: 700, fill: '#9f7b8d', linethrough: true,
  });
  canvas.add(antes);
  canvas.add(new fabric.IText('$3,50', {
    left: 60, top: 792, fontSize: 138, fontFamily: 'Inter',
    fontWeight: 900, fill: '#f472b6', charSpacing: -40,
    shadow: new fabric.Shadow({ color: 'rgba(244,114,182,0.4)', blur: 28, offsetX: 0, offsetY: 0 }),
    meta: { role: 'precio' },
  }));

  _catCta('Pidela hoy  ·  ' + CAT_TEL, 976, '#fbcfe8');
};

/* ═══════════════════════════════════════════════════════════════
   BELLEZA — barberia, salon y estetica
   ═══════════════════════════════════════════════════════════════ */

window.TEMPLATE_FNS['bell-servicio'] = function () {
  _catBg('#0f0a14', '#2e1a3d', '#c084fc');
  _catLogo();
  _catPillDerecha('DISPONIBLE', 44, '#6b21a8', '#e9d5ff', 'estado');
  _catFoto(120, 470, 'rgba(192,132,252,0.35)', 'Arrastra aqui tu trabajo');
  _catBloque('Corte + barba', 'Incluye lavado  ·  45 minutos', '$12', {
    y: 618, colorPrecio: '#c084fc', glow: 'rgba(192,132,252,0.35)',
    colorDetalle: '#c4b5d4', rolNombre: 'servicio', rolDetalle: 'detalle',
  });
  _catCta('Agenda tu cita  ·  ' + CAT_TEL, 976, '#e9d5ff');
};

window.TEMPLATE_FNS['bell-antes-despues'] = function () {
  _catBg('#0d0f14', '#1f2937', '#38bdf8');
  _catLogo();
  _catPillDerecha('TRABAJO REAL', 44, '#075985', '#bae6fd', 'estado');

  // dos huecos de foto, lado a lado
  [[60, 'ANTES'], [552, 'DESPUES']].forEach(([x, etiqueta], i) => {
    canvas.add(new fabric.Rect({
      left: x, top: 130, width: 468, height: 520, rx: 20, ry: 20,
      fill: new fabric.Gradient({
        type: 'linear', coords: { x1: 0, y1: 0, x2: 468, y2: 520 },
        colorStops: [{ offset: 0, color: '#1e293b' }, { offset: 1, color: '#334155' }],
      }),
      stroke: 'rgba(56,189,248,0.35)', strokeWidth: 2, strokeDashArray: [10, 8],
      meta: i === 0 ? { role: 'foto' } : undefined,
    }));
    canvas.add(new fabric.Rect({
      left: x + 20, top: 590, width: 150, height: 44, rx: 22, ry: 22,
      fill: 'rgba(2,6,23,0.72)',
    }));
    canvas.add(new fabric.IText(etiqueta, {
      left: x + 40, top: 601, fontSize: 20, fontFamily: 'Inter',
      fontWeight: 800, fill: '#bae6fd', charSpacing: 60,
    }));
    canvas.add(new fabric.IText('Foto aqui', {
      left: x + 160, top: 370, fontSize: 24, fontFamily: 'Inter',
      fontWeight: 600, fill: 'rgba(226,232,240,0.5)',
    }));
  });

  canvas.add(new fabric.Textbox('Alisado profesional', {
    left: 60, top: 690, width: 960, fontSize: 84, fontFamily: 'Inter',
    fontWeight: 800, fill: '#ffffff', charSpacing: -22, lineHeight: 1.02,
    meta: { role: 'servicio' },
  }));
  canvas.add(new fabric.IText('Dura hasta 4 meses  ·  2 horas', {
    left: 62, top: 800, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#94a3b8', meta: { role: 'detalle' },
  }));
  canvas.add(new fabric.IText('$45', {
    left: 58, top: 850, fontSize: 110, fontFamily: 'Inter',
    fontWeight: 900, fill: '#38bdf8', charSpacing: -30,
    meta: { role: 'precio' },
  }));

  _catCta('Agenda  ·  ' + CAT_TEL, 990, '#bae6fd');
};

window.TEMPLATE_FNS['bell-promo'] = function () {
  _catBg('#16060c', '#4a0f22', '#fb7185');
  _catLogo();
  _catPillDerecha('SOLO ESTA SEMANA', 44, '#9f1239', '#fecdd3', 'estado');
  _catFoto(120, 400, 'rgba(251,113,133,0.35)', 'Arrastra aqui tu foto');

  canvas.add(new fabric.Textbox('Manicure + pedicure', {
    left: 60, top: 540, width: 960, fontSize: 82, fontFamily: 'Inter',
    fontWeight: 900, fill: '#ffffff', charSpacing: -22, lineHeight: 1.02,
    meta: { role: 'servicio' },
  }));
  canvas.add(new fabric.IText('Esmaltado semipermanente incluido', {
    left: 62, top: 664, fontSize: 28, fontFamily: 'Inter',
    fontWeight: 600, fill: '#fecdd3', meta: { role: 'detalle' },
  }));
  canvas.add(new fabric.IText('$25', {
    left: 60, top: 716, fontSize: 52, fontFamily: 'Inter',
    fontWeight: 700, fill: '#a1707c', linethrough: true,
  }));
  canvas.add(new fabric.IText('$18', {
    left: 60, top: 786, fontSize: 138, fontFamily: 'Inter',
    fontWeight: 900, fill: '#fb7185', charSpacing: -40,
    shadow: new fabric.Shadow({ color: 'rgba(251,113,133,0.4)', blur: 28, offsetX: 0, offsetY: 0 }),
    meta: { role: 'precio' },
  }));

  _catCta('Aparta tu cupo  ·  ' + CAT_TEL, 976, '#fecdd3');
};

/* ═══════════════════════════════════════════════════════════════
   INMUEBLES — bienes raices
   ═══════════════════════════════════════════════════════════════ */

function _inmDatos(y, m2, hab, banios, color) {
  let x = 60;
  [[m2 + ' m²', 'area'], [hab + ' hab', 'hab'], [banios + ' banos', 'banios']].forEach(([txt, rol]) => {
    const w = Math.round(txt.length * 24 * 0.66) + 52;
    canvas.add(new fabric.Rect({
      left: x, top: y, width: w, height: 58, rx: 14, ry: 14,
      fill: 'rgba(255,255,255,0.07)', stroke: color, strokeWidth: 1.5,
    }));
    canvas.add(new fabric.IText(txt, {
      left: x + 26, top: y + 16, fontSize: 24, fontFamily: 'Inter',
      fontWeight: 700, fill: color, meta: { role: rol },
    }));
    x += w + 14;
  });
}

window.TEMPLATE_FNS['inm-venta'] = function () {
  _catBg('#061014', '#0d3040', '#2dd4bf');
  _catLogo();
  _catPillDerecha('EN VENTA', 44, '#115e59', '#99f6e4', 'estado');
  _catFoto(120, 420, 'rgba(45,212,191,0.35)', 'Arrastra aqui la foto del inmueble');

  canvas.add(new fabric.Textbox('Apartamento en La Castellana', {
    left: 60, top: 560, width: 960, fontSize: 74, fontFamily: 'Inter',
    fontWeight: 800, fill: '#ffffff', charSpacing: -20, lineHeight: 1.04,
    meta: { role: 'tipo' },
  }));

  _inmDatos(724, 95, 3, 2, '#5eead4');

  canvas.add(new fabric.IText('$68.000', {
    left: 58, top: 806, fontSize: 132, fontFamily: 'Inter',
    fontWeight: 900, fill: '#2dd4bf', charSpacing: -40,
    shadow: new fabric.Shadow({ color: 'rgba(45,212,191,0.35)', blur: 26, offsetX: 0, offsetY: 0 }),
    meta: { role: 'precio' },
  }));

  _catCta('Agenda la visita  ·  ' + CAT_TEL, 976, '#99f6e4');
};

window.TEMPLATE_FNS['inm-alquiler'] = function () {
  _catBg('#0a0d18', '#1e2a52', '#60a5fa');
  _catLogo();
  _catPillDerecha('EN ALQUILER', 44, '#1e40af', '#bfdbfe', 'estado');
  _catFoto(120, 420, 'rgba(96,165,250,0.35)', 'Arrastra aqui la foto del inmueble');

  canvas.add(new fabric.Textbox('Casa en Los Palos Grandes', {
    left: 60, top: 560, width: 960, fontSize: 74, fontFamily: 'Inter',
    fontWeight: 800, fill: '#ffffff', charSpacing: -20, lineHeight: 1.04,
    meta: { role: 'tipo' },
  }));

  _inmDatos(724, 140, 4, 3, '#93c5fd');

  const p = new fabric.IText('$650', {
    left: 58, top: 806, fontSize: 132, fontFamily: 'Inter',
    fontWeight: 900, fill: '#60a5fa', charSpacing: -40,
    shadow: new fabric.Shadow({ color: 'rgba(96,165,250,0.35)', blur: 26, offsetX: 0, offsetY: 0 }),
    meta: { role: 'precio' },
  });
  canvas.add(p);
  canvas.add(new fabric.IText('al mes', {
    left: 58 + p.getBoundingRect(true, true).width + 20, top: 890,
    fontSize: 38, fontFamily: 'Inter', fontWeight: 700, fill: '#bfdbfe',
  }));

  _catCta('Escribenos  ·  ' + CAT_TEL, 976, '#bfdbfe');
};

window.TEMPLATE_FNS['inm-vendido'] = function () {
  _catBg('#140609', '#3d0f18', '#fb7185');
  _catLogo();
  _catPillDerecha('VENDIDO', 44, '#7f1d1d', '#fecaca', 'estado');
  _catFoto(120, 440, 'rgba(251,113,133,0.35)', 'Arrastra aqui la foto');

  canvas.add(new fabric.Rect({
    left: 290, top: 280, width: 500, height: 112, rx: 10, ry: 10,
    fill: 'rgba(20,6,8,0.55)', stroke: '#fb7185', strokeWidth: 5, angle: -11,
  }));
  canvas.add(new fabric.IText('VENDIDO', {
    left: 332, top: 302, fontSize: 76, fontFamily: 'Inter',
    fontWeight: 900, fill: '#fb7185', charSpacing: 60, angle: -11,
  }));

  canvas.add(new fabric.Textbox('Apartamento en Sebucan', {
    left: 60, top: 600, width: 960, fontSize: 76, fontFamily: 'Inter',
    fontWeight: 800, fill: '#ffffff', charSpacing: -20, lineHeight: 1.04,
    meta: { role: 'tipo' },
  }));
  canvas.add(new fabric.IText('Entregado a su nueva familia', {
    left: 62, top: 716, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#fecdd3',
  }));
  canvas.add(new fabric.IText('ENTREGADO', {
    left: 58, top: 776, fontSize: 104, fontFamily: 'Inter',
    fontWeight: 900, fill: '#fb7185', charSpacing: -20,
    meta: { role: 'precio' },
  }));

  _catCta('Tenemos 5 mas en la zona  ·  ' + CAT_TEL, 976, '#fecdd3');
};

/* ═══════════════════════════════════════════════════════════════
   TIENDA — tienda y ropa
   ═══════════════════════════════════════════════════════════════ */

function _tieTallas(y, tallas, color, borde) {
  let x = 60;
  tallas.forEach((t, i) => {
    canvas.add(new fabric.Rect({
      left: x, top: y, width: 62, height: 58, rx: 12, ry: 12,
      fill: 'rgba(255,255,255,0.06)', stroke: borde, strokeWidth: 1.5,
    }));
    canvas.add(new fabric.IText(t, {
      left: x + 21, top: y + 16, fontSize: 24, fontFamily: 'Inter',
      fontWeight: 800, fill: color,
      meta: i === 0 ? { role: 'tallas' } : undefined,
    }));
    x += 74;
  });
}

window.TEMPLATE_FNS['tie-producto'] = function () {
  _catBg('#0b0d12', '#232a3d', '#a5b4fc');
  _catLogo();
  _catPillDerecha('DISPONIBLE', 44, '#3730a3', '#c7d2fe', 'estado');
  _catFoto(120, 430, 'rgba(165,180,252,0.35)', 'Arrastra aqui la foto del producto');

  canvas.add(new fabric.Textbox('Franela oversize', {
    left: 60, top: 570, width: 960, fontSize: 84, fontFamily: 'Inter',
    fontWeight: 800, fill: '#ffffff', charSpacing: -22, lineHeight: 1.02,
    meta: { role: 'producto' },
  }));
  canvas.add(new fabric.IText('Algodon 100%  ·  4 colores', {
    left: 62, top: 682, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#a5b4fc', meta: { role: 'detalle' },
  }));

  _tieTallas(732, ['S', 'M', 'L', 'XL'], '#c7d2fe', 'rgba(165,180,252,0.4)');

  canvas.add(new fabric.IText('$14', {
    left: 58, top: 812, fontSize: 128, fontFamily: 'Inter',
    fontWeight: 900, fill: '#a5b4fc', charSpacing: -38,
    shadow: new fabric.Shadow({ color: 'rgba(165,180,252,0.35)', blur: 26, offsetX: 0, offsetY: 0 }),
    meta: { role: 'precio' },
  }));

  _catCta('Pidela por WhatsApp  ·  ' + CAT_TEL, 976, '#c7d2fe');
};

window.TEMPLATE_FNS['tie-oferta'] = function () {
  _catBg('#120a03', '#48260a', '#fb923c');
  _catLogo();
  _catPillDerecha('-40%', 44, '#9a3412', '#fed7aa', 'estado');
  _catFoto(120, 400, 'rgba(251,146,60,0.35)', 'Arrastra aqui la foto');

  canvas.add(new fabric.Textbox('Jean recto clasico', {
    left: 60, top: 540, width: 960, fontSize: 84, fontFamily: 'Inter',
    fontWeight: 900, fill: '#ffffff', charSpacing: -22, lineHeight: 1.02,
    meta: { role: 'producto' },
  }));
  canvas.add(new fabric.IText('Ultimas piezas  ·  hasta agotar', {
    left: 62, top: 652, fontSize: 28, fontFamily: 'Inter',
    fontWeight: 600, fill: '#fed7aa', meta: { role: 'detalle' },
  }));

  _tieTallas(700, ['30', '32', '34'], '#fed7aa', 'rgba(251,146,60,0.4)');

  canvas.add(new fabric.IText('$32', {
    left: 60, top: 776, fontSize: 52, fontFamily: 'Inter',
    fontWeight: 700, fill: '#9c7350', linethrough: true,
  }));
  canvas.add(new fabric.IText('$19', {
    left: 60, top: 838, fontSize: 122, fontFamily: 'Inter',
    fontWeight: 900, fill: '#fb923c', charSpacing: -36,
    shadow: new fabric.Shadow({ color: 'rgba(251,146,60,0.4)', blur: 28, offsetX: 0, offsetY: 0 }),
    meta: { role: 'precio' },
  }));

  _catCta('Aparta la tuya  ·  ' + CAT_TEL, 990, '#fed7aa');
};

window.TEMPLATE_FNS['tie-nuevo'] = function () {
  _catBg('#08120d', '#0f3a2a', '#34d399');
  _catLogo();
  _catPillDerecha('NUEVA COLECCION', 44, '#065f46', '#a7f3d0', 'estado');
  _catFoto(120, 470, 'rgba(52,211,153,0.35)', 'Arrastra aqui la foto');
  _catBloque('Chaqueta denim', 'Coleccion nueva  ·  tallas S a XL', '$38', {
    y: 618, colorPrecio: '#34d399', glow: 'rgba(52,211,153,0.35)',
    colorDetalle: '#a7f3d0', rolNombre: 'producto', rolDetalle: 'detalle',
  });
  _catCta('Ya disponible  ·  ' + CAT_TEL, 976, '#a7f3d0');
};

/* ══════════ registro en el catalogo ══════════ */
(function registrarCatalogo() {
  const nuevas = [
    // comida
    { id: 'food-producto', name: 'Plato o producto', desc: 'Foto, descripcion y precio en $ y Bs',
      gradient: 'linear-gradient(135deg,#140b06,#3a2110 60%,#fbbf24)', category: 'comida' },
    { id: 'food-menu',     name: 'Menu del dia',     desc: 'Tres platos con su precio en una sola pieza',
      gradient: 'linear-gradient(135deg,#0c1207,#24380f 60%,#84cc16)', category: 'comida' },
    { id: 'food-promo',    name: 'Promocion',        desc: 'Precio tachado y precio nuevo',
      gradient: 'linear-gradient(135deg,#170610,#4a0d2b 60%,#f472b6)', category: 'comida' },
    // belleza
    { id: 'bell-servicio', name: 'Servicio',         desc: 'Servicio con duracion y precio',
      gradient: 'linear-gradient(135deg,#0f0a14,#2e1a3d 60%,#c084fc)', category: 'belleza' },
    { id: 'bell-antes-despues', name: 'Antes y despues', desc: 'Dos fotas lado a lado. Prueba de tu trabajo',
      gradient: 'linear-gradient(135deg,#0d0f14,#1f2937 60%,#38bdf8)', category: 'belleza' },
    { id: 'bell-promo',    name: 'Promo de la semana', desc: 'Combo con descuento',
      gradient: 'linear-gradient(135deg,#16060c,#4a0f22 60%,#fb7185)', category: 'belleza' },
    // inmuebles
    { id: 'inm-venta',     name: 'En venta',         desc: 'Zona, metros, habitaciones y precio',
      gradient: 'linear-gradient(135deg,#061014,#0d3040 60%,#2dd4bf)', category: 'inmuebles' },
    { id: 'inm-alquiler',  name: 'En alquiler',      desc: 'Canon mensual y caracteristicas',
      gradient: 'linear-gradient(135deg,#0a0d18,#1e2a52 60%,#60a5fa)', category: 'inmuebles' },
    { id: 'inm-vendido',   name: 'Vendido',          desc: 'Sello de vendido. Muestra movimiento',
      gradient: 'linear-gradient(135deg,#140609,#3d0f18 60%,#fb7185)', category: 'inmuebles' },
    // tienda
    { id: 'tie-producto',  name: 'Producto',         desc: 'Producto con tallas y precio',
      gradient: 'linear-gradient(135deg,#0b0d12,#232a3d 60%,#a5b4fc)', category: 'tienda' },
    { id: 'tie-oferta',    name: 'Oferta',           desc: 'Descuento con precio tachado',
      gradient: 'linear-gradient(135deg,#120a03,#48260a 60%,#fb923c)', category: 'tienda' },
    { id: 'tie-nuevo',     name: 'Nueva coleccion',  desc: 'Recien llegado a la tienda',
      gradient: 'linear-gradient(135deg,#08120d,#0f3a2a 60%,#34d399)', category: 'tienda' },
  ];
  nuevas.forEach(t => { if (!TEMPLATES.some(x => x.id === t.id)) TEMPLATES.push(t); });
})();

/* ══════════ variantes ══════════ */

TEMPLATE_VARIANTS['food-producto'] = [
  { producto: 'Latte',        descripcion: 'Espresso doble + leche vaporizada', precio: '$3,50', estado: 'HOY' },
  { producto: 'Capuchino',    descripcion: 'Espresso, leche y espuma',          precio: '$3,20', estado: 'HOY' },
  { producto: 'Iced Coffee',  descripcion: 'Cafe frio, hielo y leche',          precio: '$3,80', estado: 'NUEVO' },
  { producto: 'Tequeños (6)', descripcion: 'Masa artesanal, queso blanco',      precio: '$4,50', estado: 'HOY' },
];

TEMPLATE_VARIANTS['food-menu'] = [
  { producto: 'Menu de hoy',   descripcion: 'Martes 12 de agosto  ·  hasta agotar', precio: '$6,00', estado: 'MENU DEL DIA' },
  { producto: 'Almuerzo',      descripcion: 'Lunes a viernes  ·  12 a 3 pm',        precio: '$5,50', estado: 'MENU DEL DIA' },
  { producto: 'Menu ejecutivo', descripcion: 'Incluye postre y bebida',             precio: '$7,00', estado: 'MENU DEL DIA' },
];

TEMPLATE_VARIANTS['food-promo'] = [
  { producto: '2x1 en cafe',      descripcion: 'Todos los martes de 3 a 6 pm', precio: '$3,50', estado: 'PROMO' },
  { producto: 'Combo desayuno',   descripcion: 'Arepa + jugo + cafe',          precio: '$4,00', estado: 'PROMO' },
  { producto: 'Docena de tequeños', descripcion: 'Solo los viernes',           precio: '$7,50', estado: 'PROMO' },
];

TEMPLATE_VARIANTS['bell-servicio'] = [
  { servicio: 'Corte + barba',   detalle: 'Incluye lavado  ·  45 minutos',   precio: '$12', estado: 'DISPONIBLE' },
  { servicio: 'Tinte completo',  detalle: 'Producto profesional  ·  2 horas', precio: '$35', estado: 'DISPONIBLE' },
  { servicio: 'Corte de dama',   detalle: 'Lavado y secado  ·  1 hora',      precio: '$15', estado: 'DISPONIBLE' },
  { servicio: 'Cejas + pestañas', detalle: 'Diseño y laminado  ·  50 min',   precio: '$20', estado: 'AGENDA LLENA' },
];

TEMPLATE_VARIANTS['bell-antes-despues'] = [
  { servicio: 'Alisado profesional', detalle: 'Dura hasta 4 meses  ·  2 horas', precio: '$45', estado: 'TRABAJO REAL' },
  { servicio: 'Cambio de look',      detalle: 'Corte, color y peinado',         precio: '$60', estado: 'TRABAJO REAL' },
  { servicio: 'Tratamiento capilar', detalle: 'Cinco sesiones  ·  resultados reales', precio: '$80', estado: 'TRABAJO REAL' },
];

TEMPLATE_VARIANTS['bell-promo'] = [
  { servicio: 'Manicure + pedicure', detalle: 'Esmaltado semipermanente incluido', precio: '$18', estado: 'SOLO ESTA SEMANA' },
  { servicio: 'Corte + barba + cejas', detalle: 'El combo completo',               precio: '$16', estado: 'SOLO ESTA SEMANA' },
  { servicio: 'Peinado para eventos', detalle: 'Incluye maquillaje basico',        precio: '$30', estado: 'SOLO ESTA SEMANA' },
];

TEMPLATE_VARIANTS['inm-venta'] = [
  { tipo: 'Apartamento en La Castellana', precio: '$68.000', estado: 'EN VENTA' },
  { tipo: 'Casa en El Hatillo',           precio: '$135.000', estado: 'EN VENTA' },
  { tipo: 'Apartamento en Chacao',        precio: '$52.000', estado: 'EN VENTA' },
  { tipo: 'Townhouse en La Lagunita',     precio: '$189.000', estado: 'EN VENTA' },
];

TEMPLATE_VARIANTS['inm-alquiler'] = [
  { tipo: 'Casa en Los Palos Grandes', precio: '$650', estado: 'EN ALQUILER' },
  { tipo: 'Apartamento en Altamira',   precio: '$480', estado: 'EN ALQUILER' },
  { tipo: 'Estudio en Las Mercedes',   precio: '$320', estado: 'EN ALQUILER' },
];

TEMPLATE_VARIANTS['inm-vendido'] = [
  { tipo: 'Apartamento en Sebucan', precio: 'ENTREGADO', estado: 'VENDIDO' },
  { tipo: 'Casa en Santa Fe',       precio: 'ENTREGADO', estado: 'VENDIDO' },
  { tipo: 'Local en Chacao',        precio: 'ENTREGADO', estado: 'ALQUILADO' },
];

TEMPLATE_VARIANTS['tie-producto'] = [
  { producto: 'Franela oversize', detalle: 'Algodon 100%  ·  4 colores',  precio: '$14', estado: 'DISPONIBLE' },
  { producto: 'Hoodie basico',    detalle: 'Interior afelpado  ·  unisex', precio: '$26', estado: 'DISPONIBLE' },
  { producto: 'Gorra clasica',    detalle: 'Ajustable  ·  3 colores',      precio: '$11', estado: 'ULTIMAS PIEZAS' },
];

TEMPLATE_VARIANTS['tie-oferta'] = [
  { producto: 'Jean recto clasico', detalle: 'Ultimas piezas  ·  hasta agotar', precio: '$19', estado: '-40%' },
  { producto: 'Camisa de lino',     detalle: 'Fin de temporada',                precio: '$22', estado: '-30%' },
  { producto: 'Zapatos casuales',   detalle: 'Solo tallas 40 y 41',             precio: '$29', estado: '-50%' },
];

TEMPLATE_VARIANTS['tie-nuevo'] = [
  { producto: 'Chaqueta denim',  detalle: 'Coleccion nueva  ·  tallas S a XL', precio: '$38', estado: 'NUEVA COLECCION' },
  { producto: 'Vestido midi',    detalle: 'Recien llegado  ·  3 estampados',   precio: '$32', estado: 'NUEVA COLECCION' },
  { producto: 'Franela estampada', detalle: 'Edicion limitada',                precio: '$18', estado: 'NUEVA COLECCION' },
];
