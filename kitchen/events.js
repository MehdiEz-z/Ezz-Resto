import { fetchActiveOrders, updateOrderStatus, subscribeToOrders } from '../shared/api.js';
import { state } from './data.js';
import { render } from './render.js';

let unsub = null;

export async function loadOrders() {
  state.orders = await fetchActiveOrders();
  render();
}

export function setupEvents() {
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-action="next-status"]');
    if (!t) return;
    t.disabled = true;
    await updateOrderStatus(t.dataset.id, t.dataset.status);
    await loadOrders();
  });
}

export function setupRealtime() {
  if (!unsub) unsub = subscribeToOrders(() => loadOrders());
}
