/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — auth.js
   Firebase Auth (email+password) + conexión con backend Licencias.
   Flujo: login/register → idToken → Authorization: Bearer → backend valida.
   ═══════════════════════════════════════════════════════════════ */

// ── Firebase config ──
// Obtener en: Firebase Console → simplerpt-lic → Project Settings (⚙) →
// "Tus apps" → agregar Web App (</>) si no existe → copiar firebaseConfig.
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDKujVwaiHZIG7prVC1lLjhJcUG9l0--6k",
  authDomain: "simplerpt-lic.firebaseapp.com",
  projectId: "simplerpt-lic",
  storageBucket: "simplerpt-lic.firebasestorage.app",
  messagingSenderId: "1044339716977",
  appId: "1:1044339716977:web:9016eb8ec0b7e63aff3cd0",
  measurementId: "G-J4T7SS3NGF",
};

let firebaseApp = null;
let firebaseAuth = null;

function initFirebaseAuth() {
  if (!window.firebase || !window.firebase.initializeApp) {
    console.error('[auth] Firebase SDK no cargado');
    return false;
  }
  if (FIREBASE_CONFIG.apiKey.startsWith('PEGAR_AQUI')) {
    console.warn('[auth] firebaseConfig pendiente — configurar en js/auth.js');
    return false;
  }
  firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
  firebaseAuth = firebase.auth();
  firebaseAuth.onAuthStateChanged(handleAuthChange);

  // Procesa el resultado del redirect (Google sign-in con signInWithRedirect)
  firebaseAuth.getRedirectResult().catch(err => {
    if (err && err.code !== 'auth/no-auth-event') {
      console.warn('[auth] redirect result error:', err.message);
    }
  });

  return true;
}

// ── API calls ──

async function apiRegister(email, password, displayName) {
  const res = await fetch(`${STUDIO_API}/api/studio/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en registro');
  return data;
}

async function apiLogin() {
  // Login directo con Firebase SDK en cliente. El backend solo verifica tokens.
  const token = await firebaseAuth.currentUser.getIdToken();
  const res = await fetch(`${STUDIO_API}/api/studio/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en login');
  return data;
}

async function apiEnsure() {
  if (!firebaseAuth || !firebaseAuth.currentUser) return null;
  const token = await firebaseAuth.currentUser.getIdToken();
  const res = await fetch(`${STUDIO_API}/api/studio/ensure`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.json();
}

async function apiVerify() {
  if (!firebaseAuth || !firebaseAuth.currentUser) return { valid: false };
  const token = await firebaseAuth.currentUser.getIdToken();
  const res = await fetch(`${STUDIO_API}/api/studio/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return res.json();
}

async function apiSubscribe(plan, paymentMethod, txHash, amount) {
  const token = await firebaseAuth.currentUser.getIdToken();
  const res = await fetch(`${STUDIO_API}/api/studio/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ plan, paymentMethod, txHash, amount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en suscripción');
  return data;
}

// ── Flujo principal ──

async function handleAuthChange(user) {
  if (user) {
    state.user = { uid: user.uid, email: user.email, displayName: user.displayName || user.email };
    // ensure crea doc + Free si no existen (idempotente — primer login Google o email viejo)
    try { await apiEnsure(); } catch (err) { console.warn('[auth] ensure falló:', err.message); }
    // Llamar verify para obtener plan actual
    try {
      const verify = await apiVerify();
      if (verify.valid) {
        state.userPlan = verify.plan || 'free';
        state.planExpiresAt = verify.expiresAt || null;
      }
    } catch (err) {
      console.warn('[auth] verify falló:', err.message);
      state.userPlan = 'free';
    }
    // Actualizar UI
    if (typeof renderUserBadge === 'function') renderUserBadge();
    closeAuthModal();
  } else {
    state.user = null;
    state.userPlan = 'free';
    state.planExpiresAt = null;
    if (typeof renderUserBadge === 'function') renderUserBadge();
    openAuthModal(); // bloquea editor hasta login
  }
}

async function doRegister(email, password, displayName) {
  // 1. Registrar en backend (crea user Firebase Auth + doc studio_users + Free)
  await apiRegister(email, password, displayName);
  // 2. Login automático (firebase cliente)
  await firebaseAuth.signInWithEmailAndPassword(email, password);
}

async function doLogin(email, password) {
  await firebaseAuth.signInWithEmailAndPassword(email, password);
}

async function doGoogleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  // signInWithRedirect en lugar de Popup — evita errores COOP de servers como `npx serve`
  await firebaseAuth.signInWithRedirect(provider);
  // Al volver del redirect, handleAuthChange se dispara automáticamente
}

async function doLogout() {
  await firebaseAuth.signOut();
}

async function refreshPlan() {
  try {
    const verify = await apiVerify();
    if (verify.valid) {
      state.userPlan = verify.plan || 'free';
      state.planExpiresAt = verify.expiresAt || null;
      if (typeof renderUserBadge === 'function') renderUserBadge();
    }
  } catch (err) {
    console.warn('[auth] refreshPlan:', err.message);
  }
}

// ── UI helpers (expuestas para upgrade.js e index.html) ──

function openAuthModal() {
  const m = document.getElementById('authModal');
  if (m) m.classList.add('open');
}
function closeAuthModal() {
  const m = document.getElementById('authModal');
  if (m) m.classList.remove('open');
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  initFirebaseAuth();
});
