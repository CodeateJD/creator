/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — auth.js
   Firebase Auth (Google) + plan leído DIRECTO de Firestore (sin backend).
   Flujo: login Google → se asegura el doc studio_users → se lee currentPlan.
   El plan lo asigna el admin desde /creator/studio-admin/ (reglas de Firestore
   garantizan que solo el admin puede cambiar planes).
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
let firebaseDb = null;

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
  firebaseDb = firebase.firestore();
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

// Asegura el doc del usuario en Firestore (idempotente). Primer login Google → crea Free.
// Las reglas de Firestore exigen que al crearlo, currentPlan sea 'free'.
async function ensureUserDoc() {
  const u = firebaseAuth.currentUser;
  if (!u || !firebaseDb) return;
  const ref = firebaseDb.collection('studio_users').doc(u.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName || (u.email || '').split('@')[0],
      currentPlan: 'free',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }
}

// Lee el plan actual DIRECTO de Firestore (studio_users/{uid}). Aplica vencimiento.
async function readPlan() {
  const u = firebaseAuth.currentUser;
  if (!u || !firebaseDb) return { plan: 'free', expiresAt: null };
  const snap = await firebaseDb.collection('studio_users').doc(u.uid).get();
  if (!snap.exists) return { plan: 'free', expiresAt: null };
  const d = snap.data() || {};
  let plan = d.currentPlan || 'free';
  let expiresAt = d.planExpiresAt || null;
  if (plan !== 'free' && expiresAt) {
    const exp = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    if (exp < new Date()) { plan = 'free'; expiresAt = null; } // vencido → Free
  }
  return { plan, expiresAt };
}

// Solicitud de suscripción: crea una licencia 'pending' en Firestore (el admin la aprueba).
async function apiSubscribe(plan, paymentMethod, txHash, amount) {
  const u = firebaseAuth.currentUser;
  if (!u || !firebaseDb) throw new Error('Sesión no iniciada');
  const licenseId = 'STU-' + (u.uid.slice(0, 6) + Date.now().toString(36)).toUpperCase();
  await firebaseDb.collection('studio_licenses').doc(licenseId).set({
    licenseId,
    uid: u.uid,
    email: u.email,
    plan,
    status: 'pending',
    paymentMethod: paymentMethod || null,
    txHash: txHash || null,
    amount: amount || null,
    expiresAt: null,
    approvedAt: null,
    requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true, licenseId, message: 'Solicitud recibida. Se activará al confirmar el pago.' };
}

// ── Flujo principal ──

async function handleAuthChange(user) {
  if (user) {
    state.user = { uid: user.uid, email: user.email, displayName: user.displayName || user.email };
    // Asegura el doc (Free si es primer login) y lee el plan directo de Firestore.
    try { await ensureUserDoc(); } catch (err) { console.warn('[auth] ensure falló:', err.message); }
    try {
      const p = await readPlan();
      state.userPlan = p.plan;
      state.planExpiresAt = p.expiresAt;
    } catch (err) {
      console.warn('[auth] readPlan falló:', err.message);
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
  // Popup (no redirect): con authDomain en *.firebaseapp.com, signInWithRedirect NO
  // completa la sesión en Chrome (particiona el storage de terceros) y devuelve al login.
  // Popup sí funciona en prod — es lo mismo que usa el panel studio-admin. handleAuthChange
  // se dispara solo vía onAuthStateChanged.
  try {
    await firebaseAuth.signInWithPopup(provider);
  } catch (err) {
    if (err && err.code === 'auth/popup-blocked') {
      // Si el navegador bloquea el popup, caemos al redirect como último recurso.
      await firebaseAuth.signInWithRedirect(provider);
    } else if (err && err.code !== 'auth/popup-closed-by-user' &&
               err.code !== 'auth/cancelled-popup-request') {
      console.warn('[auth] login Google falló:', err.message);
      alert('No se pudo iniciar sesión con Google: ' + err.message);
    }
  }
}

async function doLogout() {
  await firebaseAuth.signOut();
}

async function refreshPlan() {
  try {
    const p = await readPlan();
    state.userPlan = p.plan;
    state.planExpiresAt = p.expiresAt;
    if (typeof renderUserBadge === 'function') renderUserBadge();
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
