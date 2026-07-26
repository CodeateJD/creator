/* ═══════════════════════════════════════════════════════════════
   codeateJD Studio — upgrade.js
   Modal de upgrade Pro + flujo de pago manual (USDT TRC-20 + Zinli).
   Reemplaza el showUpgradeModal placeholder de properties.js.
   ═══════════════════════════════════════════════════════════════ */

const PAYMENT_INFO = {
  usdt_trc20: {
    label: 'USDT (TRC-20)',
    address: 'TN2Yn6uHTn8c3GsEoz89s1dGqFGMc9MxB2',
    note: 'Envía USDT por red Tron (TRC-20). Comisión ~$1. Pega el hash de transacción abajo.',
    requiresHash: true,
  },
  zinli: {
    label: 'Zinli',
    address: 'jdelpino78@gmail.com',
    note: 'Envía a este usuario Zinli. Después sube screenshot por WhatsApp o pega referencia abajo.',
    requiresHash: false,
  },
};

const PLAN_INFO = {
  pro_monthly: { label: 'Pro Mensual', price: 4.99, sub: '/mes' },
  pro_yearly:  { label: 'Pro Anual',   price: 49.99, sub: '/año' },
};

let upgradeSelectedPlan = 'pro_monthly';
let upgradeSelectedMethod = 'usdt_trc20';

const FEATURE_TITLES = {
  capas: 'Capas ilimitadas',
  plantillas: 'Plantillas pro',
  formato: 'Formatos premium',
  colores: 'Paleta de 3 colores',
  gradientes: 'Fondos con gradiente',
  varita: 'Varita mágica',
  lasso: 'Lasso de selección',
  'pdf-pdf2img': 'PDF a imagen',
  'pdf-separar': 'Separar PDF',
  'pdf-unir': 'Unir PDF',
  descargas: 'Descargas ilimitadas',
};

// Sobrescribe el showUpgradeModal placeholder de properties.js
window.showUpgradeModal = function (feature = 'plantillas') {
  if (!state.user) {
    // Sin sesión → forzar login primero
    if (typeof openAuthModal === 'function') openAuthModal();
    return;
  }
  const title = FEATURE_TITLES[feature] || 'Plan Pro';
  const subtitle = document.getElementById('upgradeSubtitle');
  if (subtitle) subtitle.textContent = `Desbloquea: ${title} y todo lo demás.`;
  const m = document.getElementById('upgradeModal');
  if (m) {
    m.classList.add('open');
    renderUpgradePayment();
  }
};

function selectUpgradePlan(plan) {
  upgradeSelectedPlan = plan;
  document.querySelectorAll('.upg-plan').forEach(el => {
    el.classList.toggle('active', el.dataset.plan === plan);
  });
  renderUpgradePayment();
}

function selectUpgradeMethod(method) {
  upgradeSelectedMethod = method;
  document.querySelectorAll('.upg-method').forEach(el => {
    el.classList.toggle('active', el.dataset.method === method);
  });
  renderUpgradePayment();
}

function renderUpgradePayment() {
  const info = PAYMENT_INFO[upgradeSelectedMethod];
  const plan = PLAN_INFO[upgradeSelectedPlan];
  const wrap = document.getElementById('upgPayInfo');
  if (!wrap) return;
  wrap.innerHTML = `
    <div class="upg-pay-row">
      <span class="upg-pay-label">Total a pagar:</span>
      <span class="upg-pay-amount">$${plan.price.toFixed(2)} USD</span>
    </div>
    <div class="upg-pay-row">
      <span class="upg-pay-label">${upgradeSelectedMethod === 'usdt_trc20' ? 'Address' : 'Usuario'}:</span>
      <code class="upg-pay-addr" id="upgAddr">${info.address}</code>
      <button class="upg-copy-btn" onclick="copyToClipboard('${info.address}')">Copiar</button>
    </div>
    <p class="upg-pay-note">${info.note}</p>
    <div class="upg-pay-input">
      <label>${info.requiresHash ? 'Hash de transacción' : 'Referencia o nota'}</label>
      <input id="upgTxHash" placeholder="${info.requiresHash ? '0x... o T...' : 'Ej: pago Zinli ref 1234'}">
    </div>
  `;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  if (typeof showToast === 'function') showToast('Copiado: ' + text);
  else alert('Copiado: ' + text);
}

async function submitUpgrade() {
  const txHash = document.getElementById('upgTxHash')?.value?.trim();
  const info = PAYMENT_INFO[upgradeSelectedMethod];
  if (info.requiresHash && !txHash) {
    return alert('Pega el hash de transacción para validar tu pago.');
  }
  const plan = PLAN_INFO[upgradeSelectedPlan];
  const btn = document.getElementById('upgSubmitBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }
  try {
    const res = await apiSubscribe(upgradeSelectedPlan, upgradeSelectedMethod, txHash || null, plan.price);
    closeUpgradeModal();
    alert(`Solicitud enviada (${res.licenseId}). Tu plan ${plan.label} se activará al confirmar el pago.`);
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Confirmar pago'; }
  }
}

function closeUpgradeModal() {
  const m = document.getElementById('upgradeModal');
  if (m) m.classList.remove('open');
}

// User badge en topbar
function renderUserBadge() {
  const wrap = document.getElementById('userBadge');
  if (!wrap) return;
  if (!state.user) {
    wrap.innerHTML = `<button class="user-btn" onclick="openAuthModal()">Iniciar sesión</button>`;
    return;
  }
  const planLabel = state.userPlan === 'pro_monthly' ? 'Pro' : state.userPlan === 'pro_yearly' ? 'Pro Anual' : 'Free';
  const planClass = state.userPlan === 'free' ? 'free' : 'pro';
  wrap.innerHTML = `
    <span class="user-plan-badge ${planClass}">${planLabel}</span>
    <span class="user-email" title="${state.user.email}">${state.user.email}</span>
    ${state.userPlan === 'free' ? `<button class="user-upgrade-btn" onclick="showUpgradeModal('upgrade')">Hazte Pro</button>` : ''}
    <button class="user-logout-btn" onclick="doLogout()" title="Cerrar sesión" aria-label="Cerrar sesión"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></button>
  `;
}
