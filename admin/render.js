import { ui, state } from './data.js';
import { esc, money, formatDate, orderStatusLabel, getQrImageUrl } from '../shared/utils.js';
import { getClientUrl } from '../shared/api.js';

function expandCard(key, title, body, extraClass = '') {
  const open = ui.expanded.has(key);
  return `
    <div class="card ${extraClass}">
      <div class="card-head" data-action="toggle-card" data-key="${key}">
        <div class="card-title">${title}</div>
        <span class="chevron">${open ? '▲' : '▼'}</span>
      </div>
      <div class="card-body ${open ? 'open' : ''}">${body}</div>
    </div>`;
}

function renderSubtabs() {
  const el = document.getElementById('subtabs');
  if (ui.tab !== 'menu') {
    el.innerHTML = '';
    el.style.display = 'none';
    return;
  }
  el.style.display = 'flex';
  el.innerHTML = `
    <button type="button" class="subtab ${ui.subTab === 'categories' ? 'active' : ''}" data-action="set-subtab" data-tab="categories">Catégories</button>
    <button type="button" class="subtab ${ui.subTab === 'products' ? 'active' : ''}" data-action="set-subtab" data-tab="products">Produits</button>
    <button type="button" class="subtab ${ui.subTab === 'tables' ? 'active' : ''}" data-action="set-subtab" data-tab="tables">Tables & QR</button>`;
}

function renderCategories() {
  const addForm = `
    <form class="form-col" data-form="add-category">
      <input class="field" name="name" placeholder="Nom (ex : Burgers)" required>
      <input class="field" name="sort_order" type="number" placeholder="Ordre" value="0" min="0">
      <button type="submit" class="btn-primary">Ajouter</button>
    </form>`;

  const list = state.categories.length
    ? state.categories.map((c) => {
        const count = state.products.filter((p) => p.category_id === c.id).length;
        const body = `
          <form class="form-col" data-form="edit-category" data-id="${c.id}">
            <input class="field" name="name" value="${esc(c.name)}" required>
            <input class="field" name="sort_order" type="number" value="${c.sort_order}" min="0">
            <div class="btn-row">
              <button type="submit" class="btn-primary">Enregistrer</button>
              <button type="button" class="btn-danger" data-action="delete-category" data-id="${c.id}">Supprimer</button>
            </div>
          </form>`;
        return expandCard(`cat-${c.id}`, esc(c.name), body, 'card-list-neutral');
      }).join('')
    : '<p class="small-label">Aucune catégorie.</p>';

  return `
    <div class="stack">
      ${expandCard('add-category', '+ Nouvelle catégorie', addForm, 'card-add')}
      ${list}
    </div>`;
}

function renderProducts() {
  const catOptions = state.categories
    .map((c) => `<option value="${c.id}">${esc(c.name)}</option>`)
    .join('');

  const addForm = state.categories.length
    ? `
    <form class="form-col" data-form="add-product">
      <select class="field" name="category_id" required>${catOptions}</select>
      <input class="field" name="name" placeholder="Nom du produit" required>
      <textarea class="field" name="description" placeholder="Description" rows="2"></textarea>
      <input class="field" name="price" type="number" step="0.01" min="0" placeholder="Prix MAD" required>
      <label class="small-label"><input type="checkbox" name="is_active" checked> Actif</label>
      <button type="submit" class="btn-primary">Ajouter</button>
    </form>`
    : '<p class="small-label">Créez d\'abord une catégorie.</p>';

  const list = state.products.length
    ? state.products.map((p) => {
        const body = `
          <form class="form-col" data-form="edit-product" data-id="${p.id}">
            <select class="field" name="category_id" required>
              ${state.categories.map((c) => `<option value="${c.id}" ${c.id === p.category_id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
            </select>
            <input class="field" name="name" value="${esc(p.name)}" required>
            <textarea class="field" name="description" rows="2">${esc(p.description || '')}</textarea>
            <input class="field" name="price" type="number" step="0.01" min="0" value="${p.price}" required>
            <label class="small-label"><input type="checkbox" name="is_active" ${p.is_active ? 'checked' : ''}> Actif</label>
            <div class="btn-row">
              <button type="submit" class="btn-primary">Enregistrer</button>
              <button type="button" class="btn-danger" data-action="delete-product" data-id="${p.id}">Supprimer</button>
            </div>
          </form>`;
        const subtitle = `${esc(p.categories?.name || '—')} · ${money(p.price)}`;
        return expandCard(`prod-${p.id}`, `${esc(p.name)}<div class="card-range">${subtitle}</div>`, body, p.is_active ? '' : 'disabled');
      }).join('')
    : '<p class="small-label">Aucun produit.</p>';

  return `<div class="stack">${expandCard('add-product', '+ Nouveau produit', addForm, 'card-add')}${list}</div>`;
}

function renderTables() {
  const addForm = `
    <form class="form-col" data-form="add-table">
      <input class="field" name="number" type="number" min="1" placeholder="Numéro de table" required>
      <button type="submit" class="btn-primary">Créer la table</button>
    </form>`;

  const list = state.tables.length
    ? state.tables.map((t) => {
        const clientUrl = getClientUrl(t.token);
        const body = `
          <div class="qr-inline">
            <img src="${getQrImageUrl(clientUrl)}" alt="QR Table ${t.number}" width="200" height="200">
            <p class="small-label qr-url">${esc(clientUrl)}</p>
            <button type="button" class="btn-secondary" data-action="print-qr" data-url="${esc(clientUrl)}" data-label="Table ${t.number}">Imprimer</button>
          </div>
          <div class="btn-row mt-1">
            <button type="button" class="btn-secondary" data-action="toggle-table" data-id="${t.id}" data-active="${t.is_active}">
              ${t.is_active ? 'Désactiver' : 'Activer'}
            </button>
            <button type="button" class="btn-danger" data-action="delete-table" data-id="${t.id}">Supprimer</button>
          </div>`;
        return expandCard(
          `table-${t.id}`,
          `Table ${t.number}<div class="card-range">${t.is_active ? 'Active' : 'Inactive'}</div>`,
          body
        );
      }).join('')
    : '<p class="small-label">Aucune table.</p>';

  return `<div class="stack">${expandCard('add-table', '+ Nouvelle table', addForm, 'card-add')}${list}</div>`;
}

function renderOrders() {
  const filters = [
    { v: '', l: 'Toutes' },
    { v: 'new', l: 'Nouvelles' },
    { v: 'preparing', l: 'En préparation' },
    { v: 'ready', l: 'Prête' },
    { v: 'served', l: 'Servies' },
  ];

  const filtered = ui.orderFilter
    ? state.orders.filter((o) => o.status === ui.orderFilter)
    : state.orders;

  const chips = `
    <div class="chip-row period-cat-scroll" style="margin-bottom:12px">
      ${filters.map((f) => `
        <button type="button" class="chip ${ui.orderFilter === f.v ? 'is-active' : ''}" data-action="filter-orders" data-status="${f.v}">${f.l}</button>
      `).join('')}
    </div>`;

  const list = filtered.length
    ? filtered.map((o) => {
        const items = (o.order_items || [])
          .map((i) => `<li class="item-row"><span class="item-name">${i.quantity}× ${esc(i.product_name)}</span><span class="item-amount">${money(i.unit_price * i.quantity)}</span></li>`)
          .join('');
        const body = `<ul class="list">${items}</ul><p class="small-label">Total : <strong>${money(o.total)}</strong></p>`;
        const head = `Table ${o.tables?.number ?? '?'} · ${orderStatusLabel(o.status)}`;
        return expandCard(`order-${o.id}`, `${head}<div class="card-range">${formatDate(o.created_at)}</div>`, body);
      }).join('')
    : '<p class="small-label">Aucune commande.</p>';

  return `<div class="stack">${chips}${list}</div>`;
}

export function render() {
  const titles = { menu: 'Gestion du menu', commandes: 'Commandes' };
  document.getElementById('header-title').textContent = titles[ui.tab] || 'Resto-Gestion';

  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.tab === ui.tab);
  });

  renderSubtabs();

  const main = document.getElementById('main');
  if (ui.tab === 'menu') {
    if (ui.subTab === 'categories') main.innerHTML = renderCategories();
    else if (ui.subTab === 'products') main.innerHTML = renderProducts();
    else main.innerHTML = renderTables();
  } else {
    main.innerHTML = renderOrders();
  }
}
