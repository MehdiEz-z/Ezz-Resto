import { ui } from './data.js';
import { esc, money, getCart, getCartTotal, getCartItemCount } from '../shared/utils.js';

export function render() {
  const app = document.getElementById('app');
  if (!ui.table) {
    app.innerHTML = '<main class="stack" style="padding:16px"><div class="alert-banner">QR Code invalide. Scannez le code de votre table.</div></main>';
    return;
  }

  if (ui.step === 'menu') renderMenu(app);
  else if (ui.step === 'cart') renderCart(app);
  else renderRecap(app);
}

function renderMenu(app) {
  const cart = getCart(ui.tableToken);
  const count = getCartItemCount(cart);

  const categories = ui.menu.filter((c) => c.products.length > 0);
  const chips = categories.length > 1
    ? `<div class="category-chips">${categories.map((c) => `
        <button type="button" class="chip ${ui.activeCategory === c.id ? 'is-active' : ''}" data-action="pick-cat" data-id="${c.id}">${esc(c.name)}</button>
      `).join('')}</div>`
    : '';

  const sections = categories.map((cat) => `
    <div class="card card-list-neutral" id="cat-${cat.id}">
      <div class="card-head" style="cursor:default">
        <div class="card-title">${esc(cat.name)}</div>
      </div>
      <div class="card-body open">
        ${cat.products.map((p) => `
          <div class="product-row">
            <div>
              <div class="item-name">${esc(p.name)}</div>
              ${p.description ? `<div class="small-label">${esc(p.description)}</div>` : ''}
              <div class="small-label" style="color:var(--week);font-weight:700">${money(p.price)}</div>
            </div>
            <button type="button" class="icon-btn add" data-action="add-product" data-id="${p.id}">+</button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  app.innerHTML = `
    <header>
      <div class="header-title">Table ${ui.table.number}</div>
    </header>
    ${chips}
    <main class="stack">${sections || '<p class="small-label">Menu vide.</p>'}</main>
    ${count > 0 ? `
      <div class="client-cart-bar">
        <button type="button" class="btn-primary" data-action="go-cart">Panier (${count}) · ${money(getCartTotal(cart))}</button>
      </div>` : ''}`;
}

function renderCart(app) {
  const cart = getCart(ui.tableToken);
  app.innerHTML = `
    <header>
      <div class="header-title">Mon panier</div>
    </header>
    <main class="stack">
      ${cart.map((item) => `
        <div class="card">
          <div class="item-row">
            <div class="item-name">${esc(item.product_name)}<div class="small-label">${money(item.unit_price)}</div></div>
            <div class="item-actions">
              <button type="button" class="icon-btn" data-action="qty-minus" data-id="${item.product_id}">−</button>
              <span style="font-weight:700;min-width:20px;text-align:center">${item.quantity}</span>
              <button type="button" class="icon-btn add" data-action="qty-plus" data-id="${item.product_id}">+</button>
            </div>
          </div>
        </div>
      `).join('')}
      <p class="small-label" style="text-align:right;font-weight:700;font-size:16px">Total : ${money(getCartTotal(cart))}</p>
      <button type="button" class="btn-primary" data-action="go-recap">Valider la commande</button>
      <button type="button" class="btn-secondary" data-action="go-menu">Retour au menu</button>
    </main>`;
}

function renderRecap(app) {
  const cart = getCart(ui.tableToken);
  app.innerHTML = `
    <header><div class="header-title">Confirmation</div></header>
    <main class="stack">
      <div class="card"><div class="small-label">Table</div><strong>${ui.table.number}</strong></div>
      ${cart.map((i) => `
        <div class="item-row"><span>${i.quantity}× ${esc(i.product_name)}</span><span class="item-amount">${money(i.unit_price * i.quantity)}</span></div>
      `).join('')}
      <p style="text-align:right;font-weight:700">${money(getCartTotal(cart))}</p>
      <button type="button" class="btn-primary" data-action="confirm-order">Confirmer et envoyer</button>
      <button type="button" class="btn-secondary" data-action="go-cart">Retour</button>
    </main>`;
}
