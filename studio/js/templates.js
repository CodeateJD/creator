/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — templates.js
   8 plantillas predefinidas como presets de Fabric.js
   ═══════════════════════════════════════════════════════════════ */

const TEMPLATES = [
  { id: 'code-tip',   name: 'Code Tip',   desc: 'Tip de programacion con bloque de codigo', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'proyecto',   name: 'Proyecto',    desc: 'Presenta un proyecto o caso de estudio',    gradient: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  { id: 'servicio',   name: 'Servicio',    desc: 'Promociona un servicio con CTA',            gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'testimonio', name: 'Testimonio',  desc: 'Resena o testimonio de cliente',            gradient: 'linear-gradient(135deg, #ffd200, #f7971e)' },
  { id: 'marketing',  name: 'Marketing',   desc: 'Anuncio con headlines impactantes',         gradient: 'linear-gradient(135deg, #ff6a00, #ee0979)' },
  { id: 'highlight',  name: 'Highlight',   desc: 'Portada de Highlight de Instagram',         gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 'cover',      name: 'Portada',     desc: 'Cover profesional de perfil o serie',       gradient: 'linear-gradient(135deg, #0f172a, #334155)' },
  { id: 'logos',      name: 'Logos / Tech', desc: 'Muestra tecnologias o marcas',             gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { id: 'web-seo',    name: 'Página Web',   desc: 'Web que genera clientes. Futurista tech',   gradient: 'linear-gradient(135deg, #030524, #0a1a5c 60%, #00d4ff)' },
  { id: 'seo-local',  name: 'SEO Local',    desc: 'Aparece en Google cuando te buscan',        gradient: 'linear-gradient(135deg, #0a0e27, #0f2b4d 55%, #39ff14)' },
  { id: 'tech-pro',   name: 'Tech Pro',     desc: 'Servicio premium con estilo cyberpunk',     gradient: 'linear-gradient(135deg, #0d0018, #3a0066 55%, #ff00d4)' },
];

/* ══════════ VARIANTES COHERENTES POR TEMA ══════════
   Cada variante es un bundle: title + subtitle/description/stack/etc.
   Al aleatorizar, se escribe el bundle completo en los objetos con meta.role.
   Roles posibles: title, subtitle, description, badge, stack, results
*/
const TEMPLATE_VARIANTS = {
  'code-tip': [
    {
      badge: 'JavaScript', title: 'Array.map()\nGuia rapida',
      code: 'const nums = [1, 2, 3, 4, 5];\n\nconst doubled = nums.map(n => {\n  return n * 2;\n});\n\nconsole.log(doubled);\n// [2, 4, 6, 8, 10]',
    },
    {
      badge: 'JavaScript', title: 'async / await\nen 30 segundos',
      code: 'async function getUser(id) {\n  const res = await fetch(\n    `/api/users/${id}`\n  );\n  return res.json();\n}\n\nconst user = await getUser(42);',
    },
    {
      badge: 'JavaScript', title: 'Destructuring\nexplicado facil',
      code: 'const user = {\n  name: "Jose",\n  age: 30,\n  role: "admin"\n};\n\nconst { name, role } = user;\nconsole.log(name, role);',
    },
    {
      badge: 'JavaScript', title: 'Promise.all()\nen paralelo',
      code: 'const [users, posts] = \n  await Promise.all([\n    fetch("/api/users"),\n    fetch("/api/posts"),\n  ]);\n\n// ambos corren a la vez',
    },
    {
      badge: 'JavaScript', title: 'Spread operator\nel truco pro',
      code: 'const a = [1, 2, 3];\nconst b = [4, 5, 6];\n\nconst merged = [...a, ...b];\n// [1, 2, 3, 4, 5, 6]\n\nconst copy = { ...user };',
    },
    {
      badge: 'React', title: 'useState vs\nuseRef',
      code: 'const [count, setCount] = \n  useState(0); // re-renderiza\n\nconst ref = useRef(0);\nref.current++;  // no re-renderiza\n\n// useRef para valores\n// que no pintan UI',
    },
    {
      badge: 'React', title: 'Custom Hooks\nen 3 pasos',
      code: 'function useToggle(initial) {\n  const [on, setOn] =\n    useState(initial);\n  const toggle = () =>\n    setOn(v => !v);\n  return [on, toggle];\n}',
    },
    {
      badge: 'Python', title: 'List comprehension\nen accion',
      code: 'nums = [1, 2, 3, 4, 5]\n\nsquares = [n**2 for n in nums]\n# [1, 4, 9, 16, 25]\n\nevens = [n for n in nums\n         if n % 2 == 0]',
    },
    {
      badge: 'CSS', title: 'Grid vs Flexbox\nque usar',
      code: '/* Grid: layout 2D */\n.page {\n  display: grid;\n  grid-template-columns:\n    1fr 3fr;\n}\n\n/* Flex: layout 1D */\n.row { display: flex; }',
    },
    {
      badge: 'Node.js', title: 'Event Loop\nexplicado',
      code: 'console.log("1");\n\nsetTimeout(() => {\n  console.log("3");\n}, 0);\n\nPromise.resolve()\n  .then(() => console.log("2"));\n\n// Salida: 1, 2, 3',
    },
  ],
  'proyecto': [
    {
      title: 'Nombre del\nProyecto',
      description: 'Descripcion breve del proyecto, que problema\nresuelve y por que es relevante para el cliente.',
      stack: 'React  /  Node.js  /  PostgreSQL  /  AWS',
      results: '+85% rendimiento  ·  -40% costos  ·  3x usuarios',
    },
    {
      title: 'E-commerce\nFashion Store',
      description: 'Tienda online con catalogo dinamico,\ncheckout seguro y panel admin completo.',
      stack: 'Next.js  /  Stripe  /  MongoDB  /  Vercel',
      results: '+200% conversion  ·  -60% carritos abandonados',
    },
    {
      title: 'Dashboard\nAnalytics Pro',
      description: 'Panel de metricas en tiempo real con graficas\ninteractivas y exportacion de reportes.',
      stack: 'Vue 3  /  D3.js  /  Firebase  /  GCP',
      results: '50k usuarios  ·  99.9% uptime  ·  -70% tiempo',
    },
    {
      title: 'App Movil\nDelivery Express',
      description: 'App nativa de delivery con geolocalizacion\ny tracking en tiempo real.',
      stack: 'Flutter  /  Firebase  /  Maps API  /  Stripe',
      results: '10k descargas  ·  4.8 estrellas  ·  +180% ventas',
    },
    {
      title: 'Plataforma\nEducativa',
      description: 'LMS con cursos en video, quizzes y\ncertificados descargables.',
      stack: 'Django  /  PostgreSQL  /  AWS S3  /  Stripe',
      results: '3k estudiantes  ·  95% satisfaccion',
    },
    {
      title: 'Portal\nInmobiliario',
      description: 'Buscador con filtros avanzados, tour\nvirtual 360 y citas online.',
      stack: 'Laravel  /  MySQL  /  Pusher  /  AWS',
      results: '500 propiedades  ·  +120% leads cualificados',
    },
  ],
  'servicio': [
    {
      title: 'Desarrollo Web\nProfesional',
      description: 'Creamos sitios web modernos, rapidos\ny optimizados para SEO que convierten\nvisitantes en clientes.',
      cta: 'Cotiza gratis →',
    },
    {
      title: 'Tiendas Online\nQue Venden',
      description: 'E-commerce completo con pasarela de\npago, inventario y panel admin listo\npara operar.',
      cta: 'Abre tu tienda →',
    },
    {
      title: 'Apps a la Medida\niOS y Android',
      description: 'Apps nativas rapidas con una sola\nbase de codigo. Publicacion en stores\nincluida.',
      cta: 'Lanza tu app →',
    },
    {
      title: 'Diseno UX/UI\nQue Convierte',
      description: 'Interfaces limpias, accesibles y\ncentradas en el usuario para maximizar\nconversion.',
      cta: 'Mejora tu diseno →',
    },
    {
      title: 'SEO Local\nPrimera Pagina',
      description: 'Aparece cuando tus clientes te buscan\nen Google Maps y en resultados locales\nde tu ciudad.',
      cta: 'Analisis gratis →',
    },
    {
      title: 'Automatizacion\ncon IA',
      description: 'Integramos IA para automatizar procesos,\natencion al cliente y analisis que ahorran\nhoras cada semana.',
      cta: 'Agenda demo →',
    },
  ],
  'testimonio': [
    {
      title: 'El equipo de codeateJD\ntransformo nuestra presencia\ndigital por completo. Resultados\nincreibles en solo 3 meses.',
      subtitle: 'Maria Garcia',
      description: 'CEO de TechStartup',
    },
    {
      title: 'Profesionales, puntuales y\ncreativos. Nos entregaron\nmas de lo que esperabamos\ny con excelente soporte.',
      subtitle: 'Carlos Mendoza',
      description: 'Director de Marketing',
    },
    {
      title: 'Nuestro e-commerce duplico\nventas el primer trimestre.\nLa inversion se pago sola\nen menos de 60 dias.',
      subtitle: 'Laura Jimenez',
      description: 'Fundadora de ModaViva',
    },
    {
      title: 'Trabajar con codeateJD fue\nla mejor decision del ano.\nComunicacion clara y\nresultados medibles.',
      subtitle: 'Jose Ramirez',
      description: 'CTO de LogiApp',
    },
    {
      title: 'Nos ayudaron a automatizar\nprocesos y ahorrar horas\ncada semana. Altamente\nrecomendados.',
      subtitle: 'Andrea Castillo',
      description: 'Operaciones — Paramo',
    },
    {
      title: 'Diseno impecable, codigo\nlimpio y atencion al detalle.\nNuestros clientes notan\nla diferencia.',
      subtitle: 'Diego Fernandez',
      description: 'Product Manager',
    },
  ],
  'marketing': [
    {
      badge: 'OFERTA ESPECIAL',
      title: 'Tu Pagina Web\nProfesional',
      description: 'Desde',
      stack: '$299',
      results: '✓ Diseno responsive\n✓ SEO optimizado\n✓ Hosting incluido\n✓ Soporte 24/7',
    },
    {
      badge: 'LANZAMIENTO',
      title: 'Tienda Online\nLista en 7 Dias',
      description: 'Desde',
      stack: '$499',
      results: '✓ Catalogo dinamico\n✓ Pagos integrados\n✓ Panel admin\n✓ Capacitacion incluida',
    },
    {
      badge: 'COMBO PRO',
      title: 'Marketing Digital\nCompleto',
      description: 'Desde',
      stack: '$199/mes',
      results: '✓ Gestion de redes\n✓ Campanas pagadas\n✓ Reportes mensuales\n✓ Estrategia 360',
    },
    {
      badge: 'PROMO -50%',
      title: 'App Movil\nPara tu Negocio',
      description: 'Antes $1800',
      stack: '$899',
      results: '✓ iOS + Android\n✓ Panel admin\n✓ Publicacion incluida\n✓ 3 meses soporte',
    },
    {
      badge: 'PLAN STARTUP',
      title: 'Todo lo que\nNecesitas Ya',
      description: 'Desde',
      stack: '$149/mes',
      results: '✓ Web + hosting\n✓ Email corporativo\n✓ Redes administradas\n✓ Cambios ilimitados',
    },
  ],
  'highlight': [
    { icon: '🌐', title: 'WEB',  subtitle: 'Desarrollo y Diseno' },
    { icon: '💡', title: 'TIPS', subtitle: 'Consejos para tu marca' },
    { icon: '💻', title: 'CODE', subtitle: 'Programacion y trucos' },
    { icon: '⚙️', title: 'TECH', subtitle: 'Tecnologia y novedades' },
    { icon: '📊', title: 'INFO', subtitle: 'Datos que sirven' },
    { icon: '🎬', title: 'DEMO', subtitle: 'Casos y resultados' },
    { icon: '📱', title: 'APPS', subtitle: 'Movil iOS y Android' },
    { icon: '🔍', title: 'SEO',  subtitle: 'Posicionamiento Google' },
  ],
  'cover': [
    {
      badge: 'SERIE',
      title: 'Titulo de\nla Portada',
      subtitle: 'Subtitulo descriptivo o resumen breve\nde lo que trata esta serie de contenido.',
    },
    {
      badge: 'GUIA',
      title: 'Guia Completa\nde Desarrollo',
      subtitle: 'Todo lo que necesitas saber para empezar\nhoy mismo a construir productos web.',
    },
    {
      badge: 'TUTORIAL',
      title: 'Todo Sobre\nReact y Next',
      subtitle: 'Aprende a construir apps modernas con el\nstack mas demandado del mercado.',
    },
    {
      badge: 'MASTERCLASS',
      title: 'Frontend Pro\nDe Cero a Experto',
      subtitle: 'Programa intensivo con proyectos reales\npara pasar al siguiente nivel.',
    },
    {
      badge: 'E-BOOK',
      title: 'Backend\nSin Misterios',
      subtitle: 'APIs, bases de datos, autenticacion\ny despliegue explicado paso a paso.',
    },
    {
      badge: 'WORKSHOP',
      title: 'Clean Code\nen la Practica',
      subtitle: 'Tecnicas profesionales para escribir\ncodigo que otros agradeceran mantener.',
    },
  ],
  'logos': [
    {
      badge: 'STACK', title: 'Tecnologias que\nDominamos',
      tech0: 'React', tech1: 'Node.js', tech2: 'Python',
      tech3: 'AWS', tech4: 'Docker', tech5: 'PostgreSQL',
    },
    {
      badge: 'STACK', title: 'Nuestro\nStack Tecnico',
      tech0: 'Next.js', tech1: 'Express', tech2: 'TypeScript',
      tech3: 'Vercel', tech4: 'Redis', tech5: 'MongoDB',
    },
    {
      badge: 'TOOLS', title: 'Herramientas\nProfesionales',
      tech0: 'Figma', tech1: 'GitHub', tech2: 'VS Code',
      tech3: 'Notion', tech4: 'Slack', tech5: 'Linear',
    },
    {
      badge: 'MOBILE', title: 'Apps Moviles\niOS y Android',
      tech0: 'Flutter', tech1: 'React Native', tech2: 'Swift',
      tech3: 'Kotlin', tech4: 'Firebase', tech5: 'Xcode',
    },
    {
      badge: 'CLOUD', title: 'Infraestructura\nCloud Nativa',
      tech0: 'AWS', tech1: 'GCP', tech2: 'Kubernetes',
      tech3: 'Docker', tech4: 'Terraform', tech5: 'Nginx',
    },
    {
      badge: 'DATA', title: 'Bases de Datos\ny Analisis',
      tech0: 'PostgreSQL', tech1: 'MongoDB', tech2: 'Redis',
      tech3: 'BigQuery', tech4: 'Supabase', tech5: 'Prisma',
    },
    {
      badge: 'AI', title: 'IA y\nAutomatizacion',
      tech0: 'OpenAI', tech1: 'Claude', tech2: 'LangChain',
      tech3: 'n8n', tech4: 'Zapier', tech5: 'Make',
    },
  ],
};

/* ══════════ VARIANTES FUTURISTAS ══════════ */
TEMPLATE_VARIANTS['web-seo'] = [
  { badge: 'POSICIÓNATE EN TU CIUDAD', title: 'Crea una\npágina web', highlight: 'que genere\nclientes', sub: 'Para que tu negocio aparezca en Google cuando\nmás importa. Empresas y profesionales.' },
  { badge: 'WEB PROFESIONAL', title: 'Tu negocio\nsin web', highlight: 'pierde\nclientes cada día', sub: 'Cada búsqueda sin tu marca es un cliente que\nse va con la competencia.' },
  { badge: 'CODEATEJD STUDIO', title: 'Web moderna\nresponsive', highlight: 'que convierte\nvisitas en ventas', sub: 'Diseño profesional, SEO incluido y estructura\npensada para el cliente real.' },
  { badge: 'POSICIONAMIENTO', title: 'No vendas\nsin estar', highlight: 'en la primera\npágina de Google', sub: 'Si no te encuentran, no existes. Construye\ntu presencia digital seria.' },
  { badge: 'EMPRESAS Y PROS', title: 'Página web\nque trabaja', highlight: '24 / 7\npor ti', sub: 'Automatiza leads, muestra servicios y\ncierra ventas mientras duermes.' },
];
TEMPLATE_VARIANTS['seo-local'] = [
  { badge: 'SEO LOCAL', title: 'Aparece\nen Google', highlight: 'cuando te\nbuscan', sub: 'Tu ciudad te busca cada día. Hazte encontrar\nen la búsqueda local que importa.' },
  { badge: 'GOOGLE MAPS', title: 'Tu negocio\nen el mapa', highlight: 'de los\nprimeros 3', sub: 'El 75% de búsquedas locales termina en visita.\nNo dejes ese tráfico a la competencia.' },
  { badge: 'SEO CARACAS', title: 'Posicionamiento\nlocal real', highlight: 'clientes\nque sí compran', sub: 'Estrategia SEO enfocada en tu zona geográfica.\nLeads cualificados, no spam.' },
  { badge: 'GANA A TU COMPETENCIA', title: 'Mientras\nellos esperan', highlight: 'tú ya\nestás arriba', sub: 'Google Business Profile + SEO on-page + reseñas.\nLa fórmula que funciona hoy.' },
];
TEMPLATE_VARIANTS['tech-pro'] = [
  { badge: 'SERVICIO PRO', title: 'Desarrollo\nsoftware', highlight: 'para el\nfuturo de tu marca', sub: 'Stack moderno. Arquitectura escalable.\nResultados medibles desde el día uno.' },
  { badge: 'FULL STACK', title: 'Apps, webs\ny sistemas', highlight: 'construidos\npara crecer', sub: 'React, Node, Flutter, Firebase. El toolkit\nque usan las startups que escalan.' },
  { badge: 'CODEATEJD', title: 'De la idea\nal producto', highlight: 'en tiempo\nrécord', sub: 'Planificación, diseño UX, código y deploy.\nTodo con el mismo equipo.' },
  { badge: 'AUTOMATIZACIÓN', title: 'Automatiza\ny escala', highlight: 'sin contratar\nmás gente', sub: 'Integraciones, flujos n8n, bots y dashboards.\nTu equipo rinde 10x sin crecer.' },
];

function randomVariant(id) {
  const pool = TEMPLATE_VARIANTS[id];
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomizeTemplateTitle() {
  if (!state.currentTemplate) return;
  const changed = applyVariantToCanvas(state.currentTemplate);
  canvas.requestRenderAll();
  if (typeof renderLayersPanel === 'function') renderLayersPanel();
  status(`Variante aplicada (${changed} elementos)`);
}

function loadTemplate(id, done) {
  const fn = {
    'code-tip':   tpl_codeTip,
    'proyecto':   tpl_proyecto,
    'servicio':   tpl_servicio,
    'testimonio': tpl_testimonio,
    'marketing':  tpl_marketing,
    'highlight':  tpl_highlight,
    'cover':      tpl_cover,
    'logos':      tpl_logos,
    'web-seo':    tpl_webSeo,
    'seo-local':  tpl_seoLocal,
    'tech-pro':   tpl_techPro,
  };
  if (!fn[id]) return;

  const build = () => {
    canvas.clear();
    fn[id]();
    state.currentTemplate = id;
    applyVariantToCanvas(id);
    canvas.requestRenderAll();
    renderLayersPanel();
    status(`Plantilla: ${id}`);
    if (typeof done === 'function') done();
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(build);
  } else {
    build();
  }
}

// Aplica una variante aleatoria sobre los objetos ya presentes en el canvas.
// No clona ni limpia nada — solo sobreescribe el texto de cada rol.
function applyVariantToCanvas(id) {
  const variant = randomVariant(id);
  if (!variant) return 0;
  let changed = 0;
  canvas.getObjects().forEach(o => {
    const role = o.meta && o.meta.role;
    if (role && variant[role] !== undefined) {
      o.set('text', variant[role]);
      if (typeof o.initDimensions === 'function') {
        try { o.initDimensions(); o.setCoords(); } catch (_) {}
      }
      changed++;
    }
  });
  return changed;
}

/* ══════════ 1. CODE TIP ══════════ */
function tpl_codeTip() {
  setCanvasBgGradient('#1e1b4b', '#312e81', 135);

  canvas.add(new fabric.Rect({
    left: 60, top: 55, width: 160, height: 36, rx: 18, ry: 18,
    fill: '#667eea', stroke: '', strokeWidth: 0,
  }));
  canvas.add(new fabric.IText('JavaScript', {
    left: 95, top: 60, fontSize: 18, fontFamily: 'JetBrains Mono',
    fontWeight: 700, fill: '#ffffff',
    meta: { role: 'badge' },
  }));
  canvas.add(new fabric.Textbox('Array.map()\nGuia rapida', {
    left: 60, top: 120, width: 960,
    fontSize: 64, fontFamily: 'Inter',
    fontWeight: 800, fill: '#ffffff', lineHeight: 1.1,
    splitByGrapheme: false,
    meta: { role: 'title' },
  }));
  canvas.add(new fabric.Rect({
    left: 60, top: 340, width: 960, height: 480, rx: 16, ry: 16,
    fill: '#0f0a2e', stroke: '#334155', strokeWidth: 1,
  }));
  canvas.add(new fabric.Textbox(
    'const nums = [1, 2, 3, 4, 5];\n\nconst doubled = nums.map(n => {\n  return n * 2;\n});\n\nconsole.log(doubled);\n// [2, 4, 6, 8, 10]', {
    left: 90, top: 370, width: 900,
    fontSize: 28, fontFamily: 'JetBrains Mono',
    fontWeight: 400, fill: '#e2e8f0', lineHeight: 1.5,
    splitByGrapheme: false,
    meta: { role: 'code' },
  }));
  canvas.add(new fabric.Rect({
    left: 60, top: 860, width: 960, height: 4, rx: 2, ry: 2,
    fill: '#667eea',
  }));
  canvas.add(new fabric.IText('>JD', {
    left: 60, top: 890, fontSize: 28, fontFamily: 'JetBrains Mono',
    fontWeight: 700, fill: '#64748b',
  }));
  canvas.add(new fabric.IText('@codeatejd', {
    left: 860, top: 895, fontSize: 20, fontFamily: 'Inter',
    fontWeight: 600, fill: '#64748b',
  }));
}

/* ══════════ 2. PROYECTO ══════════ */
function tpl_proyecto() {
  setCanvasBgGradient('#064e3b', '#065f46', 160);

  canvas.add(new fabric.Rect({
    left: 60, top: 55, width: 180, height: 36, rx: 18, ry: 18,
    fill: '#34d399', stroke: '', strokeWidth: 0,
  }));
  canvas.add(new fabric.IText('CASO DE ESTUDIO', {
    left: 78, top: 60, fontSize: 16, fontFamily: 'Inter',
    fontWeight: 700, fill: '#064e3b',
  }));
  canvas.add(new fabric.Textbox('Nombre del\nProyecto', {
    left: 60, top: 140, width: 960,
    fontSize: 72, fontFamily: 'Montserrat',
    fontWeight: 900, fill: '#ffffff', lineHeight: 1.05,
    splitByGrapheme: false,
    meta: { role: 'title' },
  }));
  canvas.add(new fabric.Textbox('Descripcion breve del proyecto, que problema\nresuelve y por que es relevante para el cliente.', {
    left: 60, top: 360, width: 960,
    fontSize: 28, fontFamily: 'Inter',
    fontWeight: 400, fill: '#a7f3d0', lineHeight: 1.5,
    splitByGrapheme: false,
    meta: { role: 'description' },
  }));
  canvas.add(new fabric.Rect({
    left: 60, top: 520, width: 960, height: 2, rx: 1, ry: 1,
    fill: 'rgba(167,243,208,0.3)',
  }));
  canvas.add(new fabric.Textbox('React  /  Node.js  /  PostgreSQL  /  AWS', {
    left: 60, top: 550, width: 960,
    fontSize: 22, fontFamily: 'JetBrains Mono',
    fontWeight: 400, fill: '#6ee7b7',
    splitByGrapheme: false,
    meta: { role: 'stack' },
  }));
  canvas.add(new fabric.IText('Resultados', {
    left: 60, top: 650, fontSize: 20, fontFamily: 'Inter',
    fontWeight: 700, fill: '#34d399', charSpacing: 200,
  }));
  canvas.add(new fabric.Textbox('+85% rendimiento  ·  -40% costos  ·  3x usuarios', {
    left: 60, top: 700, width: 960,
    fontSize: 26, fontFamily: 'Inter',
    fontWeight: 700, fill: '#ffffff',
    splitByGrapheme: false,
    meta: { role: 'results' },
  }));
  canvas.add(new fabric.IText('>JD', {
    left: 60, top: 960, fontSize: 28, fontFamily: 'JetBrains Mono',
    fontWeight: 700, fill: '#6ee7b7',
  }));
}

/* ══════════ 3. SERVICIO ══════════ */
function tpl_servicio() {
  setCanvasBgGradient('#4c1d95', '#7c3aed', 135);

  canvas.add(new fabric.IText('🚀', {
    left: 60, top: 60, fontSize: 80, fontFamily: 'Inter',
  }));
  canvas.add(new fabric.Textbox('Desarrollo Web\nProfesional', {
    left: 60, top: 180, width: 960,
    fontSize: 68, fontFamily: 'Poppins',
    fontWeight: 900, fill: '#ffffff', lineHeight: 1.05,
    splitByGrapheme: false,
    meta: { role: 'title' },
  }));
  canvas.add(new fabric.Textbox('Creamos sitios web modernos, rapidos\ny optimizados para SEO que convierten\nvisitantes en clientes.', {
    left: 60, top: 420, width: 960,
    fontSize: 28, fontFamily: 'Inter',
    fontWeight: 400, fill: '#ddd6fe', lineHeight: 1.6,
    splitByGrapheme: false,
    meta: { role: 'description' },
  }));
  canvas.add(new fabric.Rect({
    left: 60, top: 680, width: 360, height: 68, rx: 34, ry: 34,
    fill: '#fbbf24', stroke: '', strokeWidth: 0,
  }));
  canvas.add(new fabric.IText('Cotiza gratis →', {
    left: 108, top: 695, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 700, fill: '#1e1b4b',
    meta: { role: 'cta' },
  }));
  canvas.add(new fabric.Rect({
    left: 60, top: 860, width: 960, height: 4, rx: 2, ry: 2,
    fill: 'rgba(251,191,36,0.5)',
  }));
  canvas.add(new fabric.IText('codeatejd.com', {
    left: 60, top: 890, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 600, fill: '#c4b5fd',
  }));
}

/* ══════════ 4. TESTIMONIO ══════════ */
function tpl_testimonio() {
  setCanvasBgGradient('#1e293b', '#0f172a', 180);

  canvas.add(new fabric.IText('"', {
    left: 50, top: 60, fontSize: 200, fontFamily: 'Playfair Display',
    fontWeight: 700, fill: '#667eea', opacity: 0.4,
  }));
  canvas.add(new fabric.Textbox('El equipo de codeateJD\ntransformo nuestra presencia\ndigital por completo. Resultados\nincreibles en solo 3 meses.', {
    left: 80, top: 260, width: 920,
    fontSize: 40, fontFamily: 'Playfair Display',
    fontWeight: 400, fill: '#e2e8f0', lineHeight: 1.5, fontStyle: 'italic',
    splitByGrapheme: false,
    meta: { role: 'title' },
  }));
  canvas.add(new fabric.Rect({
    left: 80, top: 700, width: 80, height: 4, rx: 2, ry: 2,
    fill: '#667eea',
  }));
  canvas.add(new fabric.IText('Maria Garcia', {
    left: 80, top: 730, fontSize: 28, fontFamily: 'Inter',
    fontWeight: 700, fill: '#ffffff',
    meta: { role: 'subtitle' },
  }));
  canvas.add(new fabric.IText('CEO de TechStartup', {
    left: 80, top: 775, fontSize: 22, fontFamily: 'Inter',
    fontWeight: 400, fill: '#94a3b8',
    meta: { role: 'description' },
  }));
  canvas.add(new fabric.IText('>JD', {
    left: 60, top: 960, fontSize: 28, fontFamily: 'JetBrains Mono',
    fontWeight: 700, fill: '#475569',
  }));
}

/* ══════════ 5. MARKETING ══════════ */
function tpl_marketing() {
  setCanvasBgGradient('#7c2d12', '#dc2626', 145);

  canvas.add(new fabric.Rect({
    left: 60, top: 60, width: 200, height: 40, rx: 20, ry: 20,
    fill: '#fbbf24', stroke: '', strokeWidth: 0,
  }));
  canvas.add(new fabric.IText('OFERTA ESPECIAL', {
    left: 83, top: 68, fontSize: 16, fontFamily: 'Inter',
    fontWeight: 800, fill: '#7c2d12',
    meta: { role: 'badge' },
  }));
  canvas.add(new fabric.Textbox('Tu Pagina Web\nProfesional', {
    left: 60, top: 160, width: 960,
    fontSize: 80, fontFamily: 'Montserrat',
    fontWeight: 900, fill: '#ffffff', lineHeight: 1.0,
    splitByGrapheme: false,
    meta: { role: 'title' },
  }));
  canvas.add(new fabric.IText('Desde', {
    left: 60, top: 420, fontSize: 28, fontFamily: 'Inter',
    fontWeight: 400, fill: '#fecaca',
    meta: { role: 'description' },
  }));
  canvas.add(new fabric.IText('$299', {
    left: 60, top: 455, fontSize: 120, fontFamily: 'Montserrat',
    fontWeight: 900, fill: '#fbbf24',
    meta: { role: 'stack' },
  }));
  canvas.add(new fabric.Textbox('✓ Diseno responsive\n✓ SEO optimizado\n✓ Hosting incluido\n✓ Soporte 24/7', {
    left: 60, top: 650, width: 960,
    fontSize: 26, fontFamily: 'Inter',
    fontWeight: 600, fill: '#ffffff', lineHeight: 1.8,
    splitByGrapheme: false,
    meta: { role: 'results' },
  }));
  canvas.add(new fabric.IText('codeatejd.com', {
    left: 60, top: 960, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 600, fill: '#fecaca',
  }));
}

/* ══════════ 6. HIGHLIGHT ══════════ */
function tpl_highlight() {
  setCanvasBgGradient('#0369a1', '#0ea5e9', 135);

  canvas.add(new fabric.IText('🌐', {
    left: 540, top: 280, fontSize: 200, fontFamily: 'Inter',
    originX: 'center', textAlign: 'center',
    meta: { role: 'icon' },
  }));
  canvas.add(new fabric.IText('WEB', {
    left: 540, top: 560, fontSize: 96, fontFamily: 'Montserrat',
    fontWeight: 900, fill: '#ffffff', originX: 'center', textAlign: 'center',
    charSpacing: 200,
    meta: { role: 'title' },
  }));
  canvas.add(new fabric.IText('Desarrollo y Diseno', {
    left: 540, top: 690, fontSize: 28, fontFamily: 'Inter',
    fontWeight: 500, fill: '#bae6fd', originX: 'center', textAlign: 'center',
    meta: { role: 'subtitle' },
  }));
  canvas.add(new fabric.IText('>JD', {
    left: 540, top: 960, fontSize: 24, fontFamily: 'JetBrains Mono',
    fontWeight: 700, fill: 'rgba(255,255,255,0.4)', originX: 'center', textAlign: 'center',
  }));
}

/* ══════════ 7. COVER / PORTADA ══════════ */
function tpl_cover() {
  setCanvasBgGradient('#020617', '#1e293b', 180);

  canvas.add(new fabric.Rect({
    left: 60, top: 60, width: 960, height: 960, rx: 0, ry: 0,
    fill: '', stroke: '#334155', strokeWidth: 1,
  }));
  canvas.add(new fabric.Rect({
    left: 540, top: 240, width: 120, height: 4, rx: 2, ry: 2,
    fill: '#667eea', originX: 'center',
  }));
  canvas.add(new fabric.IText('SERIE', {
    left: 540, top: 270, fontSize: 20, fontFamily: 'Inter',
    fontWeight: 700, fill: '#667eea', originX: 'center', textAlign: 'center',
    charSpacing: 400,
    meta: { role: 'badge' },
  }));
  canvas.add(new fabric.Textbox('Titulo de\nla Portada', {
    left: 540, top: 360, width: 900,
    fontSize: 80, fontFamily: 'Playfair Display',
    fontWeight: 700, fill: '#ffffff', originX: 'center', textAlign: 'center',
    lineHeight: 1.1,
    splitByGrapheme: false,
    meta: { role: 'title' },
  }));
  canvas.add(new fabric.Textbox('Subtitulo descriptivo o resumen breve\nde lo que trata esta serie de contenido.', {
    left: 540, top: 610, width: 900,
    fontSize: 24, fontFamily: 'Inter',
    fontWeight: 400, fill: '#94a3b8', originX: 'center', textAlign: 'center',
    lineHeight: 1.6,
    splitByGrapheme: false,
    meta: { role: 'subtitle' },
  }));
  canvas.add(new fabric.Rect({
    left: 540, top: 780, width: 120, height: 4, rx: 2, ry: 2,
    fill: '#667eea', originX: 'center',
  }));
  canvas.add(new fabric.IText('>JD', {
    left: 540, top: 830, fontSize: 36, fontFamily: 'JetBrains Mono',
    fontWeight: 700, fill: '#e2e8f0', originX: 'center', textAlign: 'center',
  }));
  canvas.add(new fabric.IText('codeatejd.com', {
    left: 540, top: 890, fontSize: 18, fontFamily: 'Inter',
    fontWeight: 500, fill: '#475569', originX: 'center', textAlign: 'center',
  }));
}

/* ══════════ 8. LOGOS / TECH ══════════ */
function tpl_logos() {
  setCanvasBgGradient('#0f172a', '#1e293b', 180);

  canvas.add(new fabric.Rect({
    left: 60, top: 55, width: 100, height: 32, rx: 16, ry: 16,
    fill: '#334155', stroke: '', strokeWidth: 0,
  }));
  canvas.add(new fabric.IText('STACK', {
    left: 79, top: 60, fontSize: 14, fontFamily: 'Inter',
    fontWeight: 700, fill: '#94a3b8',
    meta: { role: 'badge' },
  }));
  canvas.add(new fabric.Textbox('Tecnologias que\nDominamos', {
    left: 60, top: 110, width: 960,
    fontSize: 56, fontFamily: 'Montserrat',
    fontWeight: 900, fill: '#ffffff', lineHeight: 1.1,
    splitByGrapheme: false,
    meta: { role: 'title' },
  }));

  const techs = ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL'];
  const cols = 3;
  const cellW = 290;
  const cellH = 180;
  const startX = 75;
  const startY = 380;
  const gap = 20;

  techs.forEach((tech, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cellW + gap);
    const y = startY + row * (cellH + gap);

    canvas.add(new fabric.Rect({
      left: x, top: y, width: cellW, height: cellH, rx: 14, ry: 14,
      fill: '#1e293b', stroke: '#334155', strokeWidth: 1,
    }));
    canvas.add(new fabric.IText(tech, {
      left: x + cellW / 2, top: y + cellH / 2, fontSize: 24,
      fontFamily: 'JetBrains Mono', fontWeight: 700, fill: '#e2e8f0',
      originX: 'center', originY: 'center', textAlign: 'center',
      meta: { role: `tech${i}` },
    }));
  });

  canvas.add(new fabric.IText('>JD', {
    left: 60, top: 960, fontSize: 28, fontFamily: 'JetBrains Mono',
    fontWeight: 700, fill: '#475569',
  }));
}

/* ══════════ FUTURISTIC BACKGROUND HELPER ══════════ */
function drawFuturisticBg(opts) {
  const W = canvas.getWidth();
  const H = canvas.getHeight();
  const o = opts || {};
  const bg1 = o.bg1 || '#030524';
  const bg2 = o.bg2 || '#0a1a5c';
  const beam = o.beam || '#00d4ff';
  const neon = o.neon || '#39ff14';
  const particle = o.particle || '#7dd3fc';
  const angle = o.angle != null ? o.angle : 140;

  setCanvasBgGradient(bg1, bg2, angle);

  // Central hex outline
  const hex = new fabric.Polygon([
    { x: 180, y: 0 }, { x: 360, y: 100 }, { x: 360, y: 300 },
    { x: 180, y: 400 }, { x: 0, y: 300 }, { x: 0, y: 100 },
  ], {
    left: W - 420, top: H / 2 - 220,
    fill: 'rgba(0, 212, 255, 0.04)',
    stroke: beam,
    strokeWidth: 2,
    opacity: 0.55,
    shadow: new fabric.Shadow({ color: beam, blur: 30, offsetX: 0, offsetY: 0 }),
  });
  canvas.add(hex);

  // Vertical light beams
  const beamCount = 9;
  for (let i = 0; i < beamCount; i++) {
    const x = W - 440 + (i * 50) + (Math.random() * 10);
    const h = 180 + Math.random() * 520;
    const y = Math.random() * (H - h);
    const line = new fabric.Rect({
      left: x, top: y,
      width: 1.5, height: h,
      fill: i % 3 === 0 ? neon : beam,
      opacity: 0.2 + Math.random() * 0.35,
      shadow: new fabric.Shadow({ color: i % 3 === 0 ? neon : beam, blur: 12, offsetX: 0, offsetY: 0 }),
    });
    canvas.add(line);
  }

  // Particles (dots with glow)
  const dotCount = 55;
  for (let i = 0; i < dotCount; i++) {
    const r = 1 + Math.random() * 2.5;
    const x = W * 0.45 + Math.random() * (W * 0.55);
    const y = Math.random() * H;
    const color = Math.random() > 0.7 ? neon : (Math.random() > 0.4 ? beam : particle);
    const dot = new fabric.Circle({
      left: x, top: y, radius: r,
      fill: color,
      opacity: 0.4 + Math.random() * 0.55,
      shadow: new fabric.Shadow({ color: color, blur: 8, offsetX: 0, offsetY: 0 }),
    });
    canvas.add(dot);
  }

  // Bottom horizon darkening
  const horizon = new fabric.Rect({
    left: 0, top: H - 160, width: W, height: 160,
    fill: 'rgba(0,0,0,0.4)',
  });
  canvas.add(horizon);
}

/* ══════════ 9. WEB SEO (Boostori-style) ══════════ */
function tpl_webSeo() {
  drawFuturisticBg({
    bg1: '#030524', bg2: '#0a1a5c', angle: 140,
    beam: '#00d4ff', neon: '#4ade80', particle: '#7dd3fc',
  });

  canvas.add(new fabric.IText('codeate>JD', {
    left: 60, top: 55, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 800, fill: '#ffffff',
  }));

  canvas.add(new fabric.Textbox('Crea una\npágina web', {
    left: 60, top: 260, width: 560,
    fontSize: 80, fontFamily: 'Inter',
    fontWeight: 900, fill: '#ffffff', lineHeight: 1.0,
    shadow: new fabric.Shadow({ color: 'rgba(0,212,255,0.45)', blur: 18, offsetX: 0, offsetY: 0 }),
    meta: { role: 'title' },
  }));

  canvas.add(new fabric.Textbox('que genere\nclientes', {
    left: 60, top: 430, width: 560,
    fontSize: 80, fontFamily: 'Inter',
    fontWeight: 900, fill: '#4ade80', lineHeight: 1.0,
    shadow: new fabric.Shadow({ color: 'rgba(74,222,128,0.65)', blur: 22, offsetX: 0, offsetY: 0 }),
    meta: { role: 'highlight' },
  }));

  canvas.add(new fabric.Textbox('Para que tu negocio aparezca en Google cuando\nmás importa. Empresas y profesionales.', {
    left: 60, top: 610, width: 560,
    fontSize: 22, fontFamily: 'Inter',
    fontWeight: 500, fill: '#cbd5e1', lineHeight: 1.4,
    meta: { role: 'sub' },
  }));

  canvas.add(new fabric.Rect({
    left: 60, top: 800, width: 340, height: 60,
    fill: '#fde047', rx: 4, ry: 4, angle: -2,
    shadow: new fabric.Shadow({ color: 'rgba(253,224,71,0.5)', blur: 14, offsetX: 0, offsetY: 4 }),
  }));
  canvas.add(new fabric.IText('POSICIÓNATE EN TU CIUDAD', {
    left: 74, top: 817, fontSize: 20, fontFamily: 'Inter',
    fontWeight: 900, fill: '#0a0a0a', angle: -2,
    meta: { role: 'badge' },
  }));

  canvas.add(new fabric.IText('@codeatejd', {
    left: 60, top: 990, fontSize: 18, fontFamily: 'Inter',
    fontWeight: 700, fill: '#64748b',
  }));
}

/* ══════════ 10. SEO LOCAL ══════════ */
function tpl_seoLocal() {
  drawFuturisticBg({
    bg1: '#050b1f', bg2: '#0f2b4d', angle: 155,
    beam: '#22d3ee', neon: '#39ff14', particle: '#5eead4',
  });

  canvas.add(new fabric.IText('codeate>JD', {
    left: 60, top: 55, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 800, fill: '#ffffff',
  }));

  canvas.add(new fabric.Textbox('Aparece\nen Google', {
    left: 60, top: 240, width: 580,
    fontSize: 88, fontFamily: 'Inter',
    fontWeight: 900, fill: '#ffffff', lineHeight: 0.98,
    shadow: new fabric.Shadow({ color: 'rgba(34,211,238,0.5)', blur: 20, offsetX: 0, offsetY: 0 }),
    meta: { role: 'title' },
  }));

  canvas.add(new fabric.Textbox('cuando te\nbuscan', {
    left: 60, top: 420, width: 580,
    fontSize: 88, fontFamily: 'Inter',
    fontWeight: 900, fill: '#39ff14', lineHeight: 0.98,
    shadow: new fabric.Shadow({ color: 'rgba(57,255,20,0.7)', blur: 24, offsetX: 0, offsetY: 0 }),
    meta: { role: 'highlight' },
  }));

  canvas.add(new fabric.Textbox('Tu ciudad te busca cada día. Hazte encontrar\nen la búsqueda local que importa.', {
    left: 60, top: 620, width: 580,
    fontSize: 22, fontFamily: 'Inter',
    fontWeight: 500, fill: '#cbd5e1', lineHeight: 1.4,
    meta: { role: 'sub' },
  }));

  canvas.add(new fabric.Rect({
    left: 60, top: 810, width: 240, height: 56,
    fill: '#22d3ee', rx: 28, ry: 28,
    shadow: new fabric.Shadow({ color: 'rgba(34,211,238,0.7)', blur: 20, offsetX: 0, offsetY: 0 }),
  }));
  canvas.add(new fabric.IText('SEO LOCAL', {
    left: 108, top: 826, fontSize: 22, fontFamily: 'Inter',
    fontWeight: 900, fill: '#042f2e',
    meta: { role: 'badge' },
  }));

  canvas.add(new fabric.IText('@codeatejd', {
    left: 60, top: 990, fontSize: 18, fontFamily: 'Inter',
    fontWeight: 700, fill: '#64748b',
  }));
}

/* ══════════ 11. TECH PRO (cyberpunk magenta) ══════════ */
function tpl_techPro() {
  drawFuturisticBg({
    bg1: '#0d0018', bg2: '#3a0066', angle: 135,
    beam: '#ff00d4', neon: '#a855f7', particle: '#e879f9',
  });

  canvas.add(new fabric.IText('codeate>JD', {
    left: 60, top: 55, fontSize: 24, fontFamily: 'Inter',
    fontWeight: 800, fill: '#ffffff',
  }));

  canvas.add(new fabric.Textbox('Desarrollo\nsoftware', {
    left: 60, top: 260, width: 580,
    fontSize: 82, fontFamily: 'Inter',
    fontWeight: 900, fill: '#ffffff', lineHeight: 1.0,
    shadow: new fabric.Shadow({ color: 'rgba(255,0,212,0.55)', blur: 22, offsetX: 0, offsetY: 0 }),
    meta: { role: 'title' },
  }));

  canvas.add(new fabric.Textbox('para el\nfuturo de tu marca', {
    left: 60, top: 430, width: 580,
    fontSize: 58, fontFamily: 'Inter',
    fontWeight: 900, fill: '#ff00d4', lineHeight: 1.05,
    shadow: new fabric.Shadow({ color: 'rgba(255,0,212,0.8)', blur: 22, offsetX: 0, offsetY: 0 }),
    meta: { role: 'highlight' },
  }));

  canvas.add(new fabric.Textbox('Stack moderno. Arquitectura escalable.\nResultados medibles desde el día uno.', {
    left: 60, top: 650, width: 580,
    fontSize: 22, fontFamily: 'Inter',
    fontWeight: 500, fill: '#f5d0fe', lineHeight: 1.4,
    meta: { role: 'sub' },
  }));

  canvas.add(new fabric.Rect({
    left: 60, top: 820, width: 260, height: 58,
    fill: '#ff00d4', rx: 6, ry: 6, angle: -3,
    shadow: new fabric.Shadow({ color: 'rgba(255,0,212,0.8)', blur: 22, offsetX: 0, offsetY: 4 }),
  }));
  canvas.add(new fabric.IText('SERVICIO PRO', {
    left: 80, top: 838, fontSize: 22, fontFamily: 'Inter',
    fontWeight: 900, fill: '#0a0a0a', angle: -3,
    meta: { role: 'badge' },
  }));

  canvas.add(new fabric.IText('@codeatejd', {
    left: 60, top: 990, fontSize: 18, fontFamily: 'Inter',
    fontWeight: 700, fill: '#64748b',
  }));
}
