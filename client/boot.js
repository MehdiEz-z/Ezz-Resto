import { ui } from './data.js';
import { fetchActiveMenu, getTableByToken } from '../shared/api.js';
import { render } from './render.js';
import { setupEvents, setProductsMap } from './events.js';

export async function init() {
  const token = new URLSearchParams(location.search).get('table');
  if (!token) {
    document.getElementById('app').innerHTML = '<main style="padding:16px"><div class="alert-banner">Scannez le QR Code de votre table.</div></main>';
    return;
  }

  ui.tableToken = token;
  setupEvents();

  try {
    ui.table = await getTableByToken(token);
    ui.menu = await fetchActiveMenu();
    setProductsMap(ui.menu);
    if (ui.menu.length) ui.activeCategory = ui.menu.find((c) => c.products.length)?.id;
    render();
  } catch {
    document.getElementById('app').innerHTML = '<main style="padding:16px"><div class="alert-banner">Table introuvable.</div></main>';
  }
}
