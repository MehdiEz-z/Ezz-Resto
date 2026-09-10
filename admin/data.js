import * as api from '../shared/api.js';

export const ui = {
  tab: 'menu',
  subTab: 'categories',
  expanded: new Set(),
  orderFilter: '',
};

export const state = {
  categories: [],
  products: [],
  tables: [],
  orders: [],
};

export async function loadAll() {
  const [categories, products, tableList, orderList] = await Promise.all([
    api.fetchCategories(),
    api.fetchProducts(),
    api.fetchTables(),
    api.fetchOrders({ limit: 100 }),
  ]);
  state.categories = categories;
  state.products = products;
  state.tables = tableList;
  state.orders = orderList;
}
