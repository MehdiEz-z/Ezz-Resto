import { ui } from './data.js';
import { render } from './render.js';
import { addToCart, updateQuantity, getCart, clearCart, flash } from '../shared/utils.js';
import { createOrder } from '../shared/api.js';

const productsMap = new Map();

export function setProductsMap(menu) {
  productsMap.clear();
  menu.forEach((c) => c.products.forEach((p) => productsMap.set(p.id, p)));
}

export function setupEvents() {
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const action = t.dataset.action;

    if (action === 'pick-cat') {
      ui.activeCategory = t.dataset.id;
      document.getElementById(`cat-${t.dataset.id}`)?.scrollIntoView({ behavior: 'smooth' });
      render();
    } else if (action === 'add-product') {
      const p = productsMap.get(t.dataset.id);
      if (p) { addToCart(ui.tableToken, p); flash('Ajouté'); render(); }
    } else if (action === 'go-cart') { ui.step = 'cart'; render(); }
    else if (action === 'go-menu') { ui.step = 'menu'; render(); }
    else if (action === 'go-recap') { ui.step = 'recap'; render(); }
    else if (action === 'qty-minus') {
      const item = getCart(ui.tableToken).find((i) => i.product_id === t.dataset.id);
      if (item) updateQuantity(ui.tableToken, t.dataset.id, item.quantity - 1);
      render();
    } else if (action === 'qty-plus') {
      const item = getCart(ui.tableToken).find((i) => i.product_id === t.dataset.id);
      if (item) updateQuantity(ui.tableToken, t.dataset.id, item.quantity + 1);
      render();
    } else if (action === 'confirm-order') {
      try {
        await createOrder({ tableId: ui.table.id, items: getCart(ui.tableToken) });
        clearCart(ui.tableToken);
        ui.step = 'done';
        document.getElementById('app').innerHTML = `
          <main class="stack" style="padding:24px;text-align:center">
            <div style="font-size:48px">✅</div>
            <h2>Commande envoyée !</h2>
            <p class="small-label">Table ${ui.table.number} — la cuisine a été notifiée.</p>
          </main>`;
      } catch (err) {
        flash(err.message);
      }
    }
  });
}
