import * as api from '../shared/api.js';
import { ui, state, loadAll } from './data.js';
import { render } from './render.js';
import { flash, getQrImageUrl } from '../shared/utils.js';

let ready = false;

export function setupEvents() {
  if (ready) return;
  ready = true;
  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
}

async function onClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'set-tab') {
    ui.tab = target.dataset.tab;
    if (ui.tab === 'menu' && !ui.subTab) ui.subTab = 'categories';
    render();
  } else if (action === 'set-subtab') {
    ui.subTab = target.dataset.tab;
    render();
  } else if (action === 'toggle-card') {
    const key = target.dataset.key;
    if (!key) return;
    if (ui.expanded.has(key)) ui.expanded.delete(key);
    else ui.expanded.add(key);
    render();
  } else if (action === 'delete-category') {
    if (!confirm('Supprimer cette catégorie et ses produits ?')) return;
    await api.deleteCategory(target.dataset.id);
    flash('Catégorie supprimée');
    await loadAll();
    render();
  } else if (action === 'delete-product') {
    if (!confirm('Supprimer ce produit ?')) return;
    await api.deleteProduct(target.dataset.id);
    flash('Produit supprimé');
    await loadAll();
    render();
  } else if (action === 'delete-table') {
    if (!confirm('Supprimer cette table ?')) return;
    await api.deleteTable(target.dataset.id);
    flash('Table supprimée');
    await loadAll();
    render();
  } else if (action === 'toggle-table') {
    const active = target.dataset.active === 'true';
    await api.updateTable(target.dataset.id, { is_active: !active });
    await loadAll();
    render();
  } else if (action === 'filter-orders') {
    ui.orderFilter = target.dataset.status;
    render();
  } else if (action === 'print-qr') {
    const url = target.dataset.url;
    const label = target.dataset.label;
    const win = window.open('', '_blank');
    win.document.write(`<html><body style="text-align:center;font-family:sans-serif;padding:2rem"><h1>${label}</h1><img src="${getQrImageUrl(url)}" width="200"/><p style="font-size:12px">${url}</p></body></html>`);
    win.document.close();
    win.print();
  }
}

async function onSubmit(e) {
  const form = e.target;
  if (!form.dataset.form) return;
  e.preventDefault();

  try {
    if (form.dataset.form === 'add-category') {
      const fd = new FormData(form);
      await api.createCategory({
        name: fd.get('name').trim(),
        sort_order: parseInt(fd.get('sort_order'), 10) || 0,
      });
      ui.expanded.delete('add-category');
      flash('Catégorie ajoutée');
    } else if (form.dataset.form === 'edit-category') {
      const fd = new FormData(form);
      await api.updateCategory(form.dataset.id, {
        name: fd.get('name').trim(),
        sort_order: parseInt(fd.get('sort_order'), 10) || 0,
      });
      flash('Catégorie mise à jour');
    } else if (form.dataset.form === 'add-product') {
      const fd = new FormData(form);
      await api.createProduct({
        category_id: fd.get('category_id'),
        name: fd.get('name').trim(),
        description: fd.get('description')?.trim() || null,
        price: parseFloat(fd.get('price')),
        is_active: !!fd.get('is_active'),
      });
      ui.expanded.delete('add-product');
      flash('Produit ajouté');
    } else if (form.dataset.form === 'edit-product') {
      const fd = new FormData(form);
      await api.updateProduct(form.dataset.id, {
        category_id: fd.get('category_id'),
        name: fd.get('name').trim(),
        description: fd.get('description')?.trim() || null,
        price: parseFloat(fd.get('price')),
        is_active: !!fd.get('is_active'),
      });
      flash('Produit mis à jour');
    } else if (form.dataset.form === 'add-table') {
      const fd = new FormData(form);
      await api.createTable({ number: parseInt(fd.get('number'), 10) });
      ui.expanded.delete('add-table');
      flash('Table créée');
    }
    await loadAll();
    render();
  } catch (err) {
    flash(err.message);
  }
}
