import { CART_STORAGE_KEY } from './supabase.js';

/* ── Affichage ── */

export function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function money(amount) {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(amount);
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function orderStatusLabel(status) {
  const labels = { new: 'Nouvelle', preparing: 'En préparation', ready: 'Prête', served: 'Servie' };
  return labels[status] || status;
}

export function flash(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(flash._t);
  flash._t = setTimeout(() => { el.style.display = 'none'; }, 2800);
}

export function getQrImageUrl(clientUrl) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(clientUrl)}`;
}

/* ── Chemins (QR codes GitHub Pages) ── */

export function getBasePath() {
  if (typeof window === 'undefined') return '';
  if (window.location.hostname.endsWith('github.io')) {
    const segment = window.location.pathname.split('/').filter(Boolean)[0];
    return segment ? `/${segment}` : '';
  }
  return '';
}

export function appPath(relativePath) {
  const base = getBasePath();
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${base}${path}`;
}

/* ── Panier client (localStorage) ── */

function cartKey(tableToken) {
  return `${CART_STORAGE_KEY}_${tableToken}`;
}

export function getCart(tableToken) {
  const raw = localStorage.getItem(cartKey(tableToken));
  return raw ? JSON.parse(raw) : [];
}

export function saveCart(tableToken, items) {
  localStorage.setItem(cartKey(tableToken), JSON.stringify(items));
}

export function addToCart(tableToken, product, quantity = 1) {
  const cart = getCart(tableToken);
  const existing = cart.find((i) => i.product_id === product.id);
  if (existing) existing.quantity += quantity;
  else cart.push({ product_id: product.id, product_name: product.name, unit_price: product.price, quantity });
  saveCart(tableToken, cart);
  return cart;
}

export function updateQuantity(tableToken, productId, quantity) {
  let cart = getCart(tableToken);
  if (quantity <= 0) cart = cart.filter((i) => i.product_id !== productId);
  else {
    const item = cart.find((i) => i.product_id === productId);
    if (item) item.quantity = quantity;
  }
  saveCart(tableToken, cart);
  return cart;
}

export function clearCart(tableToken) {
  localStorage.removeItem(cartKey(tableToken));
}

export function getCartTotal(cart) {
  return cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);
}

export function getCartItemCount(cart) {
  return cart.reduce((s, i) => s + i.quantity, 0);
}
