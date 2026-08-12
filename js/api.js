/**
 * API client for hnyzu-buy-server
 */
const API_BASE = (() => {
  const meta = document.querySelector('meta[name="api-base"]');
  if (meta?.content) return meta.content.replace(/\/$/, '');
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return 'http://localhost:8787';
  }
  return 'https://api.eraworks.vn';
})();

const TOKEN_KEY = 'buy_token';
const USER_KEY = 'buy_user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setAuth(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

export function clearAuth() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data.data;
}

export const api = {
  health: () => request('/api/health'),
  sendCode: (email) => request('/api/auth/send-code', { method: 'POST', body: JSON.stringify({ email }) }),
  verify: (email, code, name) => request('/api/auth/verify', { method: 'POST', body: JSON.stringify({ email, code, name }) }),
  me: () => request('/api/auth/me'),
  updateProfile: (name) => request('/api/auth/profile', { method: 'PATCH', body: JSON.stringify({ name }) }),
  products: () => request('/api/products'),
  cart: () => request('/api/cart'),
  addToCart: (product_id, quantity = 1) => request('/api/cart/items', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
  updateCartItem: (id, quantity) => request(`/api/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  removeCartItem: (id) => request(`/api/cart/items/${id}`, { method: 'DELETE' }),
  addresses: () => request('/api/addresses'),
  createAddress: (data) => request('/api/addresses', { method: 'POST', body: JSON.stringify(data) }),
  updateAddress: (id, data) => request(`/api/addresses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAddress: (id) => request(`/api/addresses/${id}`, { method: 'DELETE' }),
  setDefaultAddress: (id) => request(`/api/addresses/${id}/default`, { method: 'POST' }),
  checkout: (address_id, payment_method, note) => request('/api/orders/checkout', { method: 'POST', body: JSON.stringify({ address_id, payment_method, note }) }),
  orders: () => request('/api/orders'),
  order: (id) => request(`/api/orders/${id}`),
};

export function formatVnd(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function productName(p, lang) {
  if (!p) return '';
  if (lang === 'zh') return p.name_zh || p.name_vi;
  if (lang === 'en') return p.name_en || p.name_vi;
  return p.name_vi;
}

export function getLang() {
  try { return localStorage.getItem('site_lang') || 'vi'; } catch { return 'vi'; }
}

const LOGIN_LABELS = { vi: 'Đăng nhập', zh: '登录', en: 'Login' };

export const HEADER_LOGOS = {
  vi: 'img/logo-vi.png',
  zh: 'img/logo-zh.png',
  en: 'img/logo-en.png',
};

/** 按语言切换顶部 Logo 图 */
export function updateHeaderLogo(lang) {
  const l = lang || getLang();
  const src = HEADER_LOGOS[l] || HEADER_LOGOS.vi;
  document.querySelectorAll('#headerLogo, .logo-wordmark').forEach((img) => {
    if (img.tagName === 'IMG') img.src = src;
  });
}

/** 更新顶部用户按钮：已登录显示用户名，未登录显示登录文案 */
export function updateUserBtn(lang) {
  const btn = document.getElementById('userBtn');
  if (!btn) return;
  const user = getStoredUser();
  if (user?.email) {
    btn.textContent = user.email.split('@')[0];
  } else {
    const l = lang || getLang();
    btn.textContent = LOGIN_LABELS[l] || LOGIN_LABELS.vi;
  }
}

export function requireAuth(redirect = 'account.html') {
  if (!getToken()) {
    location.href = redirect + '?return=' + encodeURIComponent(location.pathname + location.search);
    return false;
  }
  return true;
}

export function updateProductQtyBadges(items) {
  const qtyMap = {};
  (items || []).forEach(i => { qtyMap[i.product_id] = i.quantity; });
  document.querySelectorAll('[data-product-qty]').forEach(el => {
    const qty = qtyMap[el.dataset.productQty] || 0;
    el.textContent = qty > 0 ? String(qty) : '';
    el.style.display = qty > 0 ? 'flex' : 'none';
  });
}

export function updateCartBadge(count) {
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count > 0 ? String(count) : '';
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

export async function refreshCartBadge() {
  if (!getToken()) {
    updateCartBadge(0);
    updateProductQtyBadges([]);
    return;
  }
  try {
    const data = await api.cart();
    updateCartBadge(data.count || 0);
    updateProductQtyBadges(data.items || []);
  } catch {
    updateCartBadge(0);
    updateProductQtyBadges([]);
  }
}

export function showToast(msg, type = 'info') {
  let el = document.getElementById('shopToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'shopToast';
    el.className = 'shop-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `shop-toast shop-toast-${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2800);
}

export function qs(name) {
  return new URLSearchParams(location.search).get(name);
}
