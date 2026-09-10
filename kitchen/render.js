import { state, STATUS_FLOW, STATUS_ACTION } from './data.js';
import { esc, money, formatDate, orderStatusLabel } from '../shared/utils.js';

export function render() {
  const main = document.getElementById('main');
  if (!state.orders.length) {
    main.innerHTML = '<p class="small-label" style="text-align:center;padding:32px">Aucune commande en cours.</p>';
    return;
  }

  main.innerHTML = `<div class="stack">${state.orders.map((o) => {
    const items = (o.order_items || []).map((i) =>
      `<li class="item-row"><span class="item-name">${i.quantity}× ${esc(i.product_name)}</span><span class="item-amount">${money(i.unit_price * i.quantity)}</span></li>`
    ).join('');
    const next = STATUS_FLOW[o.status];
    return `
      <div class="card card-list-neutral">
        <div class="card-head" style="cursor:default">
          <div>
            <div class="card-title">Table ${o.tables?.number ?? '?'}</div>
            <div class="card-range">${formatDate(o.created_at)} · ${orderStatusLabel(o.status)}</div>
          </div>
          <span class="badge badge-current">${money(o.total)}</span>
        </div>
        <div class="card-body open">
          <ul class="list">${items}</ul>
          ${next ? `<button type="button" class="btn-primary" data-action="next-status" data-id="${o.id}" data-status="${next}">${STATUS_ACTION[o.status]}</button>` : ''}
        </div>
      </div>`;
  }).join('')}</div>`;
}
