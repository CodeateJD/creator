/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — rubros.js
   La columna vertebral del catalogo de plantillas.

   Un rubro NO es una etiqueta para agrupar tarjetas. Un rubro define:
     · campos      — la ficha del negocio (que columnas tiene su lista)
     · plantillas  — cuales estan disenadas para esos campos
     · textos      — el caption y el mensaje de WhatsApp, con sus campos
     · ejemplo     — filas de muestra, para no arrancar con la tabla vacia

   Los rubros de fabrica viven aqui. Los que cree el usuario viven en
   localStorage y se mezclan con estos: ver getRubros().
   ═══════════════════════════════════════════════════════════════ */

const RUBROS_USER_KEY = 'codeateJD_studio_rubros_user';

/* Tipos de campo soportados:
   texto · numero · precio · imagen · estado · lista · destacado          */

const RUBROS = {

  general: {
    nombre: 'Cualquier negocio',
    desc: 'Sirven para todo: testimonios, ofertas, portadas',
    familia: 'mixta',
    plantillas: ['proyecto', 'servicio', 'testimonio', 'marketing', 'highlight', 'cover'],
    campos: [
      { id: 'foto',      label: 'Foto',        tipo: 'imagen' },
      { id: 'titulo',    label: 'Titulo',      tipo: 'texto' },
      { id: 'detalle',   label: 'Detalle',     tipo: 'texto' },
      { id: 'precio',    label: 'Precio',      tipo: 'precio' },
      { id: 'estado',    label: 'Estado',      tipo: 'estado',
        opciones: ['disponible', 'agotado'] },
    ],
    textos: {
      caption:  '{{titulo}}\n{{detalle}}\n\nEscribenos 👉 {{whatsapp}}',
      whatsapp: 'Hola, me interesa {{titulo}}',
    },
    ejemplo: [
      { titulo: 'Nuestro servicio estrella', detalle: 'Lo que mas nos piden', precio: 25, estado: 'disponible' },
    ],
  },

  programacion: {
    nombre: 'Programacion y software',
    desc: 'Servicios de desarrollo, tips y portafolio',
    familia: 'servicio',
    plantillas: ['code-tip', 'logos', 'web-seo', 'seo-local', 'tech-pro', 'code-pro', 'dev-hero', 'no-wp'],
    campos: [
      { id: 'foto',       label: 'Imagen de fondo', tipo: 'imagen' },
      { id: 'servicio',   label: 'Servicio',        tipo: 'texto' },
      { id: 'titular',    label: 'Titular',         tipo: 'texto' },
      { id: 'destacado',  label: 'Palabra en color', tipo: 'destacado', origen: 'titular' },
      { id: 'subtitulo',  label: 'Subtitulo',       tipo: 'texto' },
      { id: 'beneficios', label: 'Beneficios',      tipo: 'lista', min: 3, max: 5 },
      { id: 'precio',     label: 'Desde',           tipo: 'precio' },
      { id: 'entrega',    label: 'Tiempo de entrega', tipo: 'texto' },
      { id: 'cupos',      label: 'Cupos del mes',   tipo: 'numero' },
      { id: 'estado',     label: 'Estado',          tipo: 'estado',
        opciones: ['abierto', 'ultimos cupos', 'cerrado'] },
    ],
    textos: {
      caption:  '{{titular}}\n{{subtitulo}}\n\nDesde ${{precio}} · entrega {{entrega}}\nAgenda 👉 {{whatsapp}}',
      whatsapp: 'Hola, quiero informacion sobre {{servicio}}',
    },
    ejemplo: [
      { servicio: 'Chatbot con IA', titular: 'Impulsa tu empresa con un chatbot de ultima generacion',
        destacado: 'chatbot', subtitulo: 'Soluciones de IA personalizadas para tu negocio.',
        beneficios: ['Atencion 24/7 sin costos extras', 'Respuestas instantaneas y precisas', 'Gestion eficiente de leads', 'Integracion con tus herramientas'],
        precio: 890, entrega: '3 a 6 semanas', cupos: 2, estado: 'abierto' },
      { servicio: 'Pagina web', titular: 'Una pagina web que trae clientes, no adorno',
        destacado: 'pagina web', subtitulo: 'Cinco secciones, SEO local y hosting el primer ano.',
        beneficios: ['Apareces en Google en tu ciudad', 'Boton de WhatsApp en cada seccion', 'Se ve bien en el telefono primero', 'Hosting y dominio el primer ano'],
        precio: 280, entrega: '10 dias habiles', cupos: 4, estado: 'abierto' },
    ],
  },

  vehiculos: {
    nombre: 'Concesionario y venta de vehiculos',
    desc: 'Un post por carro, y se marcan solos cuando se venden',
    familia: 'catalogo',
    plantillas: ['auto-venta', 'auto-nuevo', 'auto-cuota', 'auto-vendido'],
    campos: [
      { id: 'foto',   label: 'Foto',   tipo: 'imagen' },
      { id: 'marca',  label: 'Marca',  tipo: 'texto' },
      { id: 'modelo', label: 'Modelo', tipo: 'texto' },
      { id: 'anio',   label: 'Año',    tipo: 'numero' },
      { id: 'km',     label: 'Kilometraje', tipo: 'numero' },
      { id: 'detalle', label: 'Detalle', tipo: 'texto' },
      { id: 'precio', label: 'Precio', tipo: 'precio' },
      { id: 'estado', label: 'Estado', tipo: 'estado',
        opciones: ['disponible', 'reservado', 'vendido'] },
    ],
    textos: {
      caption:  '🚗 {{marca}} {{modelo}} {{anio}}\n{{km}} km · {{detalle}}\n\n💵 {{precio}}\nEscribeme 👉 {{whatsapp}}',
      whatsapp: 'Hola, me interesa el {{marca}} {{modelo}} {{anio}}',
    },
    ejemplo: [
      { marca: 'Toyota', modelo: 'Corolla S', anio: 2021, km: 32400, detalle: 'automatico', precio: 18900, estado: 'disponible' },
      { marca: 'Toyota', modelo: '4Runner',   anio: 2019, km: 78000, detalle: '4x4',        precio: 34500, estado: 'disponible' },
      { marca: 'Ford',   modelo: 'Explorer',  anio: 2018, km: 96200, detalle: '7 puestos',  precio: 21700, estado: 'disponible' },
    ],
  },

  comida: {
    nombre: 'Restaurante, cafe y panaderia',
    desc: 'Carta, platos del dia y precios que cambian solos',
    familia: 'catalogo',
    plantillas: ['food-producto', 'food-menu', 'food-promo'],
    campos: [
      { id: 'foto',        label: 'Foto',        tipo: 'imagen' },
      { id: 'producto',    label: 'Plato o producto', tipo: 'texto' },
      { id: 'descripcion', label: 'Descripcion', tipo: 'texto' },
      { id: 'categoria',   label: 'Categoria',   tipo: 'texto' },
      { id: 'precio',      label: 'Precio',      tipo: 'precio' },
      { id: 'estado',      label: 'Estado',      tipo: 'estado',
        opciones: ['disponible', 'agotado', 'nuevo'] },
    ],
    textos: {
      caption:  '{{producto}}\n{{descripcion}}\n\n{{precio}}\nPidelo por WhatsApp 👉 {{whatsapp}}',
      whatsapp: 'Hola, quiero pedir {{producto}}',
    },
    ejemplo: [
      { producto: 'Latte',       descripcion: 'Espresso doble + leche vaporizada', categoria: 'Calientes', precio: 3.5, estado: 'disponible' },
      { producto: 'Capuchino',   descripcion: 'Espresso, leche y espuma',          categoria: 'Calientes', precio: 3.2, estado: 'disponible' },
      { producto: 'Iced Coffee', descripcion: 'Cafe frio, hielo y leche',          categoria: 'Frios',     precio: 3.8, estado: 'nuevo' },
    ],
  },

  salud: {
    nombre: 'Consultorio y salud',
    desc: 'Especialidades, horarios y disponibilidad de agenda',
    familia: 'servicio',
    plantillas: ['sal-consulta', 'sal-llena', 'sal-tip'],
    campos: [
      { id: 'especialidad', label: 'Especialidad', tipo: 'texto' },
      { id: 'titular',      label: 'Titular',      tipo: 'texto' },
      { id: 'destacado',    label: 'Palabra en color', tipo: 'destacado', origen: 'titular' },
      { id: 'doctor',       label: 'Profesional',  tipo: 'texto' },
      { id: 'horario',      label: 'Dias y horario', tipo: 'texto' },
      { id: 'incluye',      label: 'La consulta incluye', tipo: 'lista', min: 3, max: 5 },
      { id: 'precio',       label: 'Precio',       tipo: 'precio' },
      { id: 'agenda',       label: 'Agenda',       tipo: 'estado',
        opciones: ['abierta', 'ultimos cupos', 'llena'] },
    ],
    textos: {
      caption:  '{{titular}}\n{{doctor}} · {{horario}}\n\nConsulta: {{precio}}\nAgenda tu cita 👉 {{whatsapp}}',
      whatsapp: 'Hola, quiero agendar una cita de {{especialidad}}',
    },
    ejemplo: [
      { especialidad: 'Cardiologia', titular: 'Cuida tu corazon con consulta especializada',
        destacado: 'corazon', doctor: 'Dra. A. Rivas', horario: 'lunes y miercoles, 2:00 a 5:00 pm',
        incluye: ['Electrocardiograma incluido', 'Consulta de 40 minutos', 'Informe el mismo dia', 'Control de seguimiento sin costo'],
        precio: 35, agenda: 'abierta' },
    ],
  },

  academia: {
    nombre: 'Academia, escuela y cursos',
    desc: 'Cursos con cupos que bajan todos los dias',
    familia: 'servicio',
    plantillas: ['aca-curso', 'aca-cerrado', 'aca-abren'],
    campos: [
      { id: 'curso',     label: 'Curso',     tipo: 'texto' },
      { id: 'titular',   label: 'Titular',   tipo: 'texto' },
      { id: 'destacado', label: 'Palabra en color', tipo: 'destacado', origen: 'titular' },
      { id: 'profesor',  label: 'Profesor',  tipo: 'texto' },
      { id: 'inicia',    label: 'Fecha de inicio', tipo: 'texto' },
      { id: 'horario',   label: 'Horario',   tipo: 'texto' },
      { id: 'incluye',   label: 'El curso incluye', tipo: 'lista', min: 3, max: 5 },
      { id: 'cupos',     label: 'Cupos disponibles', tipo: 'numero' },
      { id: 'precio',    label: 'Precio',    tipo: 'precio' },
      { id: 'estado',    label: 'Estado',    tipo: 'estado',
        opciones: ['inscripciones abiertas', 'ultimos cupos', 'cerrado'] },
    ],
    textos: {
      caption:  '{{titular}}\n{{profesor}} · inicia {{inicia}}\n{{horario}}\n\n{{precio}} al mes · quedan {{cupos}} cupos\nAparta el tuyo 👉 {{whatsapp}}',
      whatsapp: 'Hola, quiero informacion del curso {{curso}}',
    },
    ejemplo: [
      { curso: 'Ingles A1', titular: 'Aprende ingles desde cero en 8 semanas',
        destacado: 'ingles', profesor: 'Prof. L. Mora', inicia: '5 de agosto',
        horario: 'martes y jueves 6:00 pm',
        incluye: ['Grupos de maximo 8 alumnos', 'Material digital incluido', 'Certificado al terminar', 'Primera clase de prueba gratis'],
        cupos: 3, precio: 45, estado: 'ultimos cupos' },
    ],
  },

  belleza: {
    nombre: 'Barberia, salon y estetica',
    desc: 'Servicios con precio y disponibilidad',
    familia: 'catalogo',
    plantillas: ['bell-servicio', 'bell-antes-despues', 'bell-promo'],
    campos: [
      { id: 'foto',      label: 'Foto',      tipo: 'imagen' },
      { id: 'servicio',  label: 'Servicio',  tipo: 'texto' },
      { id: 'detalle',   label: 'Detalle',   tipo: 'texto' },
      { id: 'duracion',  label: 'Duracion',  tipo: 'texto' },
      { id: 'precio',    label: 'Precio',    tipo: 'precio' },
      { id: 'estado',    label: 'Estado',    tipo: 'estado',
        opciones: ['disponible', 'agenda llena'] },
    ],
    textos: {
      caption:  '{{servicio}}\n{{detalle}} · {{duracion}}\n\n{{precio}}\nAgenda 👉 {{whatsapp}}',
      whatsapp: 'Hola, quiero agendar {{servicio}}',
    },
    ejemplo: [
      { servicio: 'Corte + barba', detalle: 'Incluye lavado', duracion: '45 min', precio: 12, estado: 'disponible' },
    ],
  },

  inmuebles: {
    nombre: 'Bienes raices',
    desc: 'Un post por inmueble, con zona, metros y precio',
    familia: 'catalogo',
    plantillas: ['inm-venta', 'inm-alquiler', 'inm-vendido'],
    campos: [
      { id: 'foto',      label: 'Fotos',       tipo: 'imagen' },
      { id: 'tipo',      label: 'Tipo',        tipo: 'texto' },
      { id: 'zona',      label: 'Zona',        tipo: 'texto' },
      { id: 'm2',        label: 'Metros',      tipo: 'numero' },
      { id: 'hab',       label: 'Habitaciones', tipo: 'numero' },
      { id: 'banios',    label: 'Banos',       tipo: 'numero' },
      { id: 'precio',    label: 'Precio',      tipo: 'precio' },
      { id: 'estado',    label: 'Estado',      tipo: 'estado',
        opciones: ['disponible', 'reservado', 'vendido'] },
    ],
    textos: {
      caption:  '🏠 {{tipo}} en {{zona}}\n{{m2}} m² · {{hab}} hab · {{banios}} banos\n\n💵 {{precio}}\nEscribeme 👉 {{whatsapp}}',
      whatsapp: 'Hola, me interesa el {{tipo}} en {{zona}}',
    },
    ejemplo: [
      { tipo: 'Apartamento', zona: 'La Castellana', m2: 95, hab: 3, banios: 2, precio: 68000, estado: 'disponible' },
    ],
  },

  tienda: {
    nombre: 'Tienda y ropa',
    desc: 'Productos con tallas, colores y precio',
    familia: 'catalogo',
    plantillas: ['tie-producto', 'tie-oferta', 'tie-nuevo'],
    campos: [
      { id: 'foto',     label: 'Foto',     tipo: 'imagen' },
      { id: 'producto', label: 'Producto', tipo: 'texto' },
      { id: 'detalle',  label: 'Detalle',  tipo: 'texto' },
      { id: 'tallas',   label: 'Tallas',   tipo: 'lista', min: 1, max: 8 },
      { id: 'precio',   label: 'Precio',   tipo: 'precio' },
      { id: 'estado',   label: 'Estado',   tipo: 'estado',
        opciones: ['disponible', 'ultimas piezas', 'agotado'] },
    ],
    textos: {
      caption:  '{{producto}}\n{{detalle}}\nTallas: {{tallas}}\n\n{{precio}}\nPidelo 👉 {{whatsapp}}',
      whatsapp: 'Hola, quiero {{producto}}',
    },
    ejemplo: [
      { producto: 'Franela oversize', detalle: 'Algodon 100%', tallas: ['S','M','L','XL'], precio: 14, estado: 'disponible' },
    ],
  },

};

/* Orden en que aparecen en el desplegable */
const RUBROS_ORDEN = [
  'general', 'programacion', 'vehiculos', 'comida',
  'salud', 'academia', 'belleza', 'inmuebles', 'tienda',
];

/* ══════════ RUBROS DEL USUARIO ══════════
   Un rubro no tiene por que venir de fabrica: si el negocio no encaja en
   ninguno, el usuario crea el suyo y le define los campos. Se guardan aparte
   y se mezclan con los de fabrica.                                        */

function getRubrosUser() {
  try { return JSON.parse(localStorage.getItem(RUBROS_USER_KEY) || '{}'); }
  catch { return {}; }
}

function saveRubrosUser(obj) {
  try { localStorage.setItem(RUBROS_USER_KEY, JSON.stringify(obj)); return true; }
  catch { alert('No hay espacio para guardar el rubro en este navegador.'); return false; }
}

// Todos los rubros, de fabrica + los tuyos, en orden.
function getRubros() {
  const user = getRubrosUser();
  const todos = {};
  RUBROS_ORDEN.forEach(id => { if (RUBROS[id]) todos[id] = { ...RUBROS[id], id, propio: false }; });
  Object.keys(RUBROS).forEach(id => { if (!todos[id]) todos[id] = { ...RUBROS[id], id, propio: false }; });
  Object.keys(user).forEach(id => { todos[id] = { ...user[id], id, propio: true }; });
  return todos;
}

function getRubro(id) {
  return getRubros()[id] || null;
}

function crearRubroPropio(nombre, camposBase) {
  const clean = String(nombre || '').trim().slice(0, 40);
  if (!clean) return null;
  const id = 'mio_' + Date.now();
  const user = getRubrosUser();
  user[id] = {
    nombre: clean,
    desc: 'Rubro propio',
    familia: 'catalogo',
    plantillas: [],
    campos: camposBase && camposBase.length ? camposBase : [
      { id: 'foto',    label: 'Foto',    tipo: 'imagen' },
      { id: 'titulo',  label: 'Titulo',  tipo: 'texto' },
      { id: 'detalle', label: 'Detalle', tipo: 'texto' },
      { id: 'precio',  label: 'Precio',  tipo: 'precio' },
      { id: 'estado',  label: 'Estado',  tipo: 'estado', opciones: ['disponible', 'agotado'] },
    ],
    textos: {
      caption:  '{{titulo}}\n{{detalle}}\n\n{{precio}}\nEscribenos 👉 {{whatsapp}}',
      whatsapp: 'Hola, me interesa {{titulo}}',
    },
    ejemplo: [],
  };
  if (!saveRubrosUser(user)) return null;
  return id;
}

function borrarRubroPropio(id) {
  const user = getRubrosUser();
  if (!user[id]) return false;
  delete user[id];
  return saveRubrosUser(user);
}

/* ══════════ PLANTILLAS DE UN RUBRO ══════════ */

// Ids de las plantillas de fabrica que le tocan a un rubro. Si el rubro no
// declara ninguna, se cae a las de "cualquier negocio" para no dejar la
// pantalla vacia — y el modal avisa que a ese rubro le faltan las suyas.
function plantillasDeRubro(id) {
  const r = getRubro(id);
  if (!r) return [];
  return (r.plantillas || []).filter(tid => TEMPLATES.some(t => t.id === tid));
}

function rubroTienePlantillasPropias(id) {
  return plantillasDeRubro(id).length > 0;
}

// A que rubro pertenece una plantilla de fabrica (para marcarla y agruparla)
function rubroDePlantilla(tplId) {
  const todos = getRubros();
  for (const id of Object.keys(todos)) {
    if ((todos[id].plantillas || []).includes(tplId)) return id;
  }
  return 'general';
}
