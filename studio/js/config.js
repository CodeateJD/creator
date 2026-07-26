/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — config.js
   Constantes globales: formatos, fuentes, state compartido
   ═══════════════════════════════════════════════════════════════ */

const FORMATS = {
  post:     { w: 1080, h: 1080, label: 'Post 1:1',    free: true  },
  fb:       { w: 1200, h:  630, label: 'Facebook',    free: true  },
  story:    { w: 1080, h: 1920, label: 'Story 9:16',  free: false },
  linkedin: { w: 1200, h:  627, label: 'LinkedIn',    free: false },
  x:        { w: 1600, h:  900, label: 'X / Twitter', free: false },
};

const FREE_DOWNLOAD_LIMIT = 3;
const FREE_DOWNLOAD_KEY = 'codeateJD_studio_free_downloads';

const FONTS = [
  { name: 'Inter',             family: 'Inter',             cat: 'sans' },
  { name: 'Poppins',           family: 'Poppins',           cat: 'sans' },
  { name: 'Montserrat',        family: 'Montserrat',        cat: 'sans' },
  { name: 'Raleway',           family: 'Raleway',           cat: 'sans' },
  { name: 'Space Grotesk',     family: 'Space Grotesk',     cat: 'sans' },
  { name: 'Roboto',            family: 'Roboto',            cat: 'sans' },
  { name: 'Playfair Display',  family: 'Playfair Display',  cat: 'serif' },
  { name: 'Lora',              family: 'Lora',              cat: 'serif' },
  { name: 'Bebas Neue',        family: 'Bebas Neue',        cat: 'display' },
  { name: 'JetBrains Mono',    family: 'JetBrains Mono',    cat: 'mono' },
];

const state = {
  format: 'post',
  zoom: 1,
  fitZoom: 1,
  tool: 'select',
  shapeType: 'rect',
  currentTemplate: null,
  userPlan: 'free', // 'free' | 'pro_monthly' | 'pro_yearly' — sincronizado con backend Licencias
  user: null,        // { uid, email, displayName } cuando hay sesión
  planExpiresAt: null, // ISO string o timestamp del backend
  publish: {
    caption: '',
    hashtags: '',
    alt: '',
  },
  activeColor: '#667eea',
  colorHistory: [],
  activeColorSlot: 0,
  activeColors: ['#667eea', '#4ade80', '#f5576c'],
};

// Monetización EN PAUSA (Jose, 26-jul-2026: "olvidate de planes, cómo vamos a
// cobrar por algo que no está completo"). Con esto TODO queda desbloqueado:
// capas, logo, herramientas y formatos, sin candados Pro. El producto primero
// funciona; el modelo Free/Pro se reactiva poniendo esto en true.
const MONETIZACION_ACTIVA = false;

function isPro() {
  if (!MONETIZACION_ACTIVA) return true;
  return state.userPlan === 'pro_monthly' || state.userPlan === 'pro_yearly';
}

// Backend Licencias — cambiar a URL de producción cuando se despliegue
const STUDIO_API = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? 'http://localhost:4000'
  : 'https://licencias.codeatejd.com'; // pendiente confirmar dominio prod

const FREE_MAX_LAYERS = 3;
function canAddLayer() {
  if (isPro()) return true;
  const currentCount = (typeof canvas !== 'undefined' && canvas.getObjects) ? canvas.getObjects().length : 0;
  return currentCount < FREE_MAX_LAYERS;
}
function enforceLayerLimit() {
  if (!canAddLayer()) {
    if (typeof showUpgradeModal === 'function') showUpgradeModal('capas');
    else alert(`Plan Free: máximo ${FREE_MAX_LAYERS} capas. Upgrade a Pro para capas ilimitadas.`);
    return false;
  }
  return true;
}
function hasPlantillasAccess() { return isPro(); }
function isFormatAvailable(fmt) {
  const f = FORMATS[fmt];
  if (!f) return false;
  return f.free || isPro();
}
function getFreeDownloadCount() {
  return parseInt(localStorage.getItem(FREE_DOWNLOAD_KEY) || '0', 10);
}
function incFreeDownloadCount() {
  localStorage.setItem(FREE_DOWNLOAD_KEY, String(getFreeDownloadCount() + 1));
}
function getRemainingFreeDownloads() {
  return Math.max(0, FREE_DOWNLOAD_LIMIT - getFreeDownloadCount());
}

const SHAPE_TYPES = [
  { id: 'rect',     label: 'Rectangulo' },
  { id: 'circle',   label: 'Circulo' },
  { id: 'triangle', label: 'Triangulo' },
  { id: 'line',     label: 'Linea' },
  { id: 'arrow',    label: 'Flecha' },
  { id: 'star',     label: 'Estrella' },
];

const BG_PRESETS = [
  { name: 'Blanco',  color: '#ffffff' },
  { name: 'Negro',   color: '#0a0e1a' },
  { name: 'Crema',   color: '#fef3c7' },
  { name: 'Rosa',    color: '#fce7f3' },
  { name: 'Cielo',   color: '#dbeafe' },
  { name: 'Menta',   color: '#d1fae5' },
  { name: 'Lila',    color: '#e9d5ff' },
  { name: 'Coral',   color: '#ffe4e6' },
];

const BG_GRADIENTS = [
  { name: 'Atardecer', c1: '#f093fb', c2: '#f5576c' },
  { name: 'Oceano',    c1: '#4facfe', c2: '#00f2fe' },
  { name: 'Bosque',    c1: '#11998e', c2: '#38ef7d' },
  { name: 'Fuego',     c1: '#ff6a00', c2: '#ee0979' },
  { name: 'Real',      c1: '#667eea', c2: '#764ba2' },
  { name: 'Oro',       c1: '#f6d365', c2: '#fda085' },
  { name: 'Noche',     c1: '#0f172a', c2: '#334155' },
  { name: 'Pastel',    c1: '#a8edea', c2: '#fed6e3' },
];
