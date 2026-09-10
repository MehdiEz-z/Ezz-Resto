import { loadOrders, setupEvents, setupRealtime } from './events.js';

export async function init() {
  setupEvents();
  setupRealtime();
  await loadOrders();
}
