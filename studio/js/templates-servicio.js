/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — templates-servicio.js
   Plantillas de los rubros de FAMILIA SERVICIO:
     · salud     — consultorio medico
     · academia  — escuela y cursos

   En esta familia manda el MENSAJE, no la foto: titular grande con una
   palabra en color, subtitulo, panel de beneficios y barra de contacto.
   La referencia visual es el post del chatbot de codeateJD.

   Sin datos reales: telefono 0400-000-0000 y "TU LOGO".
   ═══════════════════════════════════════════════════════════════ */

window.TEMPLATE_FNS = window.TEMPLATE_FNS || {};

const SRV_TEL = '0400-000-0000';

/* ══════════ helpers de la familia servicio ══════════ */

function _srvFondo(c1, c2, halo) {
  setCanvasBgGradient(c1, c2, 155);
  canvas.add(new fabric.Circle({ left: -180, top: 620, radius: 380, fill: halo, opacity: 0.13 }));
  canvas.add(new fabric.Circle({ left: 760, top: -260, radius: 330, fill: halo, opacity: 0.16 }));
}

function _srvLogo(nombre, acento) {
  canvas.add(new fabric.IText(nombre || 'TU LOGO', {
    left: 60, top: 52, fontSize: 26, fontFamily: 'Inter',
    fontWeight: 800, fill: '#ffffff', charSpacing: 60,
  }));
  canvas.add(new fabric.Rect({ left: 60, top: 88, width: 46, height: 4, fill: acento }));
}

function _srvEtiqueta(texto, acento, fondo) {
  const fs = 22;
  const w  = Math.round(texto.length * fs * 0.66) + 46;
  canvas.add(new fabric.Rect({
    left: 1020 - w, top: 44, width: w, height: 52, rx: 26, ry: 26, fill: fondo,
  }));
  canvas.add(new fabric.IText(texto, {
    left: 1020 - w + 23, top: 58, fontSize: fs, fontFamily: 'Inter',
    fontWeight: 800, fill: acento, charSpacing: 40,
    meta: { role: 'estado' },
  }));
}

/* Titular grande. Devuelve la Y donde termina. */
function _srvTitular(texto, y, fs) {
  const t = new fabric.Textbox(texto, {
    left: 60, top: y, width: 900,
    fontSize: fs || 86, fontFamily: 'Inter', fontWeight: 900,
    fill: '#ffffff', lineHeight: 1.0, charSpacing: -26,
    meta: { role: 'titular' },
  });
  canvas.add(t);
  return y + t.getBoundingRect(true, true).height;
}

/* Panel con las lineas de beneficios. Devuelve la Y donde termina. */
function _srvBeneficios(lineas, y, acento, borde) {
  const alto = 34 + lineas.length * 54;
  canvas.add(new fabric.Rect({
    left: 60, top: y, width: 960, height: alto, rx: 20, ry: 20,
    fill: 'rgba(3,10,16,0.42)', stroke: borde, strokeWidth: 1.5,
  }));
  lineas.forEach((linea, i) => {
    const ly = y + 26 + i * 54;
    canvas.add(new fabric.Circle({ left: 96, top: ly + 10, radius: 8, fill: acento }));
    canvas.add(new fabric.IText(linea, {
      left: 132, top: ly, fontSize: 28, fontFamily: 'Inter',
      fontWeight: 700, fill: '#ffffff',
      meta: i === 0 ? { role: 'incluye' } : undefined,
    }));
  });
  return y + alto;
}

/* Barra de contacto a todo el ancho, abajo del todo */
function _srvBarra(texto, fondo, color) {
  canvas.add(new fabric.Rect({ left: 0, top: 962, width: 1080, height: 118, fill: fondo }));
  canvas.add(new fabric.Circle({ left: 60, top: 992, radius: 25, fill: '#25D366' }));
  canvas.add(new fabric.IText('W', {
    left: 74, top: 1000, fontSize: 26, fontFamily: 'Inter', fontWeight: 900, fill: '#0a1d26',
  }));
  canvas.add(new fabric.IText(texto, {
    left: 128, top: 1000, fontSize: 32, fontFamily: 'Inter',
    fontWeight: 800, fill: color, meta: { role: 'cta' },
  }));
}

/* ═══════════════════════════════════════════════════════════════
   SALUD — consultorio medico
   ═══════════════════════════════════════════════════════════════ */

window.TEMPLATE_FNS['sal-consulta'] = function () {
  _srvFondo('#04131c', '#0d3d4e', '#22d3ee');
  _srvLogo('CENTRO MEDICO', '#22d3ee');
  _srvEtiqueta('AGENDA ABIERTA', '#a5f3fc', '#155e75');

  canvas.add(new fabric.IText('CONSULTA ESPECIALIZADA', {
    left: 60, top: 150, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 800, fill: '#67e8f9', charSpacing: 120,
  }));

  const fin = _srvTitular('Cuida tu corazon con atencion especializada', 196, 84);

  canvas.add(new fabric.IText('Dra. A. Rivas  ·  lunes y miercoles, 2:00 a 5:00 pm', {
    left: 62, top: fin + 22, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#a5f3fc', meta: { role: 'doctor' },
  }));

  canvas.add(new fabric.IText('$35', {
    left: 58, top: fin + 76, fontSize: 96, fontFamily: 'Inter',
    fontWeight: 900, fill: '#22d3ee', charSpacing: -30,
    meta: { role: 'precio' },
  }));
  canvas.add(new fabric.IText('la consulta', {
    left: 250, top: fin + 132, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#a5f3fc',
  }));

  _srvBeneficios([
    'Electrocardiograma incluido',
    'Consulta de 40 minutos',
    'Informe el mismo dia',
    'Control de seguimiento sin costo',
  ], 682, '#22d3ee', 'rgba(34,211,238,0.34)');

  _srvBarra('Agenda tu cita  ·  ' + SRV_TEL, '#04131c', '#e0f7fb');
};

window.TEMPLATE_FNS['sal-llena'] = function () {
  _srvFondo('#1a0a0d', '#4a1620', '#fb7185');
  _srvLogo('CENTRO MEDICO', '#fb7185');
  _srvEtiqueta('SIN CUPOS', '#fecaca', '#7f1d1d');

  canvas.add(new fabric.IText('AVISO DE AGENDA', {
    left: 60, top: 150, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 800, fill: '#fda4af', charSpacing: 120,
  }));

  const fin = _srvTitular('Pediatria: agenda llena esta semana', 196, 88);

  canvas.add(new fabric.IText('Dr. L. Herrera  ·  proxima disponibilidad: 4 de agosto', {
    left: 62, top: fin + 22, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#fecdd3', meta: { role: 'doctor' },
  }));

  canvas.add(new fabric.IText('Lista de espera abierta', {
    left: 58, top: fin + 76, fontSize: 62, fontFamily: 'Inter',
    fontWeight: 900, fill: '#fb7185', charSpacing: -18,
    meta: { role: 'precio' },
  }));

  _srvBeneficios([
    'Dejanos tu nombre y telefono',
    'Te avisamos antes que a nadie',
    'Urgencias se atienden aparte',
    'Control de nino sano sigue abierto',
  ], 682, '#fb7185', 'rgba(251,113,133,0.34)');

  _srvBarra('Anotate en la lista  ·  ' + SRV_TEL, '#1a0a0d', '#fecdd3');
};

window.TEMPLATE_FNS['sal-tip'] = function () {
  _srvFondo('#061a10', '#0e3f2a', '#34d399');
  _srvLogo('CENTRO MEDICO', '#34d399');
  _srvEtiqueta('SALUD', '#a7f3d0', '#065f46');

  canvas.add(new fabric.IText('CONSEJO DE LA SEMANA', {
    left: 60, top: 150, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 800, fill: '#6ee7b7', charSpacing: 120,
  }));

  const fin = _srvTitular('Cuatro senales de que debes medirte la tension', 196, 84);

  canvas.add(new fabric.IText('Si tienes alguna, pide una cita sin esperar.', {
    left: 62, top: fin + 22, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#a7f3d0', meta: { role: 'doctor' },
  }));

  _srvBeneficios([
    'Dolor de cabeza al despertar',
    'Zumbido en los oidos',
    'Vision borrosa sin motivo',
    'Cansancio con esfuerzo minimo',
  ], 620, '#34d399', 'rgba(52,211,153,0.34)');

  canvas.add(new fabric.IText('Esto no sustituye una consulta medica', {
    left: 62, top: 900, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 600, fill: '#86bfa5',
  }));

  _srvBarra('Pide tu cita  ·  ' + SRV_TEL, '#061a10', '#d1fae5');
};

/* ═══════════════════════════════════════════════════════════════
   ACADEMIA — escuela y cursos
   ═══════════════════════════════════════════════════════════════ */

window.TEMPLATE_FNS['aca-curso'] = function () {
  _srvFondo('#100a24', '#2e1d63', '#a78bfa');
  _srvLogo('TU ACADEMIA', '#a78bfa');
  _srvEtiqueta('QUEDAN 3 CUPOS', '#ddd6fe', '#5b21b6');

  canvas.add(new fabric.IText('INSCRIPCIONES ABIERTAS', {
    left: 60, top: 150, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 800, fill: '#c4b5fd', charSpacing: 120,
  }));

  const fin = _srvTitular('Aprende ingles desde cero en 8 semanas', 196, 88);

  canvas.add(new fabric.IText('Prof. L. Mora  ·  inicia 5 de agosto  ·  mar y jue 6:00 pm', {
    left: 62, top: fin + 22, fontSize: 28, fontFamily: 'Inter',
    fontWeight: 600, fill: '#c4b5fd', meta: { role: 'profesor' },
  }));

  const p = new fabric.IText('$45', {
    left: 58, top: fin + 72, fontSize: 100, fontFamily: 'Inter',
    fontWeight: 900, fill: '#a78bfa', charSpacing: -32,
    meta: { role: 'precio' },
  });
  canvas.add(p);
  canvas.add(new fabric.IText('al mes', {
    left: 58 + p.getBoundingRect(true, true).width + 20, top: fin + 130,
    fontSize: 32, fontFamily: 'Inter', fontWeight: 700, fill: '#ddd6fe',
  }));

  _srvBeneficios([
    'Grupos de maximo 8 alumnos',
    'Material digital incluido',
    'Certificado al terminar',
    'Primera clase de prueba gratis',
  ], 676, '#a78bfa', 'rgba(167,139,250,0.34)');

  _srvBarra('Aparta tu cupo  ·  ' + SRV_TEL, '#100a24', '#ede9fe');
};

window.TEMPLATE_FNS['aca-cerrado'] = function () {
  _srvFondo('#1a1206', '#4a3208', '#fbbf24');
  _srvLogo('TU ACADEMIA', '#fbbf24');
  _srvEtiqueta('SECCION CERRADA', '#fde68a', '#854d0e');

  canvas.add(new fabric.IText('CUPOS AGOTADOS', {
    left: 60, top: 150, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 800, fill: '#fcd34d', charSpacing: 120,
  }));

  const fin = _srvTitular('Excel para el trabajo: seccion completa', 196, 88);

  canvas.add(new fabric.IText('Abrimos seccion nueva el 9 de septiembre', {
    left: 62, top: fin + 22, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#fde68a', meta: { role: 'profesor' },
  }));

  canvas.add(new fabric.IText('Lista de espera', {
    left: 58, top: fin + 76, fontSize: 76, fontFamily: 'Inter',
    fontWeight: 900, fill: '#fbbf24', charSpacing: -22,
    meta: { role: 'precio' },
  }));

  _srvBeneficios([
    'Anotate y reservas prioridad',
    'Te avisamos antes de abrir',
    'Mismo precio garantizado',
    'Sabados de 9:00 a 12:00',
  ], 682, '#fbbf24', 'rgba(251,191,36,0.34)');

  _srvBarra('Anotate  ·  ' + SRV_TEL, '#1a1206', '#fef3c7');
};

window.TEMPLATE_FNS['aca-abren'] = function () {
  _srvFondo('#04141a', '#0b3f4a', '#2dd4bf');
  _srvLogo('TU ACADEMIA', '#2dd4bf');
  _srvEtiqueta('ULTIMOS DIAS', '#99f6e4', '#115e59');

  canvas.add(new fabric.IText('CIERRE DE INSCRIPCIONES', {
    left: 60, top: 150, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 800, fill: '#5eead4', charSpacing: 120,
  }));

  const fin = _srvTitular('Quedan 4 dias para inscribirte', 196, 92);

  canvas.add(new fabric.IText('Las clases arrancan el lunes 18 de agosto', {
    left: 62, top: fin + 22, fontSize: 30, fontFamily: 'Inter',
    fontWeight: 600, fill: '#99f6e4', meta: { role: 'profesor' },
  }));

  // tres cursos abiertos
  let y = fin + 82;
  [['Ingles A1', '3 cupos'], ['Excel avanzado', '5 cupos'], ['Contabilidad basica', '2 cupos']].forEach(([c, cu]) => {
    canvas.add(new fabric.Rect({
      left: 60, top: y, width: 960, height: 84, rx: 16, ry: 16,
      fill: 'rgba(45,212,191,0.10)', stroke: 'rgba(45,212,191,0.34)', strokeWidth: 1.5,
    }));
    canvas.add(new fabric.IText(c, {
      left: 92, top: y + 24, fontSize: 34, fontFamily: 'Inter', fontWeight: 700, fill: '#ffffff',
    }));
    canvas.add(new fabric.IText(cu, {
      left: 840, top: y + 26, fontSize: 30, fontFamily: 'Inter', fontWeight: 800, fill: '#5eead4',
    }));
    y += 98;
  });

  canvas.add(new fabric.IText('Cupos limitados', {
    left: 58, top: y + 8, fontSize: 46, fontFamily: 'Inter',
    fontWeight: 900, fill: '#2dd4bf', charSpacing: -12,
    meta: { role: 'precio' },
  }));

  _srvBarra('Inscribete hoy  ·  ' + SRV_TEL, '#04141a', '#ccfbf1');
};

/* ══════════ registro ══════════ */
(function registrarServicio() {
  const nuevas = [
    { id: 'sal-consulta', name: 'Consulta', desc: 'Especialidad, horario, que incluye y precio',
      gradient: 'linear-gradient(135deg,#04131c,#0d3d4e 60%,#22d3ee)', category: 'salud' },
    { id: 'sal-llena',    name: 'Agenda llena', desc: 'Sin cupos + lista de espera',
      gradient: 'linear-gradient(135deg,#1a0a0d,#4a1620 60%,#fb7185)', category: 'salud' },
    { id: 'sal-tip',      name: 'Consejo de salud', desc: 'Contenido educativo que atrae pacientes',
      gradient: 'linear-gradient(135deg,#061a10,#0e3f2a 60%,#34d399)', category: 'salud' },
    { id: 'aca-curso',    name: 'Curso con cupos', desc: 'Profesor, inicio, que incluye y cupos',
      gradient: 'linear-gradient(135deg,#100a24,#2e1d63 60%,#a78bfa)', category: 'academia' },
    { id: 'aca-cerrado',  name: 'Seccion cerrada', desc: 'Cupos agotados + lista de espera',
      gradient: 'linear-gradient(135deg,#1a1206,#4a3208 60%,#fbbf24)', category: 'academia' },
    { id: 'aca-abren',    name: 'Cierre de inscripciones', desc: 'Varios cursos con sus cupos',
      gradient: 'linear-gradient(135deg,#04141a,#0b3f4a 60%,#2dd4bf)', category: 'academia' },
  ];
  nuevas.forEach(t => { if (!TEMPLATES.some(x => x.id === t.id)) TEMPLATES.push(t); });
})();

/* ══════════ variantes ══════════ */

TEMPLATE_VARIANTS['sal-consulta'] = [
  { titular: 'Cuida tu corazon con atencion especializada', doctor: 'Dra. A. Rivas  ·  lunes y miercoles, 2:00 a 5:00 pm', precio: '$35', estado: 'AGENDA ABIERTA', incluye: 'Electrocardiograma incluido' },
  { titular: 'Tu piel merece un diagnostico serio',         doctor: 'Dr. M. Salas  ·  martes y jueves, 8:00 a 12:00 m',   precio: '$30', estado: 'AGENDA ABIERTA', incluye: 'Dermatoscopia digital incluida' },
  { titular: 'Chequeo general completo en una sola visita', doctor: 'Dra. C. Ponte  ·  lunes a viernes, 7:00 a 11:00 am', precio: '$55', estado: 'AGENDA ABIERTA', incluye: 'Laboratorio basico incluido' },
];

TEMPLATE_VARIANTS['sal-llena'] = [
  { titular: 'Pediatria: agenda llena esta semana',    doctor: 'Dr. L. Herrera  ·  proxima disponibilidad: 4 de agosto', precio: 'Lista de espera', estado: 'SIN CUPOS' },
  { titular: 'Ginecologia sin cupos hasta el lunes',   doctor: 'Dra. R. Marin  ·  reabrimos el 11 de agosto',            precio: 'Lista de espera', estado: 'SIN CUPOS' },
];

TEMPLATE_VARIANTS['sal-tip'] = [
  { titular: 'Cuatro senales de que debes medirte la tension', doctor: 'Si tienes alguna, pide una cita sin esperar.', estado: 'SALUD' },
  { titular: 'Como saber si tu dolor de espalda necesita medico', doctor: 'No todo dolor se pasa con reposo.',        estado: 'SALUD' },
  { titular: 'Cada cuanto deberias hacerte un chequeo',        doctor: 'Depende de tu edad y tus antecedentes.',       estado: 'SALUD' },
];

TEMPLATE_VARIANTS['aca-curso'] = [
  { titular: 'Aprende ingles desde cero en 8 semanas',   profesor: 'Prof. L. Mora  ·  inicia 5 de agosto  ·  mar y jue 6:00 pm',   precio: '$45', estado: 'QUEDAN 3 CUPOS' },
  { titular: 'Domina Excel para conseguir mejor trabajo', profesor: 'Prof. M. Sanchez  ·  inicia 12 de agosto  ·  sabados 9:00 am', precio: '$38', estado: 'QUEDAN 5 CUPOS' },
  { titular: 'Programacion web desde cero en 12 semanas', profesor: 'Prof. J. Diaz  ·  inicia 19 de agosto  ·  lun y mie 7:00 pm',  precio: '$60', estado: 'QUEDAN 2 CUPOS' },
];

TEMPLATE_VARIANTS['aca-cerrado'] = [
  { titular: 'Excel para el trabajo: seccion completa', profesor: 'Abrimos seccion nueva el 9 de septiembre', precio: 'Lista de espera', estado: 'SECCION CERRADA' },
  { titular: 'Ingles A1: no quedan cupos',             profesor: 'Proxima seccion: 2 de septiembre',         precio: 'Lista de espera', estado: 'SECCION CERRADA' },
];

/* El titular largo ya NO se desborda: auto-fit.js le baja la fuente hasta que
   cabe en el hueco que le dejo el diseno. Por eso se deja uno largo aqui a
   proposito, como prueba viva de que el ajuste funciona.                    */
TEMPLATE_VARIANTS['aca-abren'] = [
  { titular: 'Quedan 4 dias para inscribirte',        profesor: 'Las clases arrancan el lunes 18 de agosto', precio: 'Cupos limitados', estado: 'ULTIMOS DIAS' },
  { titular: 'Ultimos dias de inscripcion',           profesor: 'No dejes tu cupo para ultima hora',         precio: 'Cupos limitados', estado: 'ULTIMOS DIAS' },
  { titular: 'Cierran las inscripciones este viernes', profesor: 'Despues abrimos seccion en septiembre',    precio: 'Cupos limitados', estado: 'ULTIMOS DIAS' },
];
