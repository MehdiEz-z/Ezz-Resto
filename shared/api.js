/**
 * Tous les appels Supabase — menu, tables, commandes.
 */
import { supabase, ORDER_STATUS } from './supabase.js';
import { appPath } from './utils.js';

/* ── Menu ── */

export async function fetchActiveMenu() {
  const { data, error } = await supabase
    .from('categories')
    .select('*, products(*)')
    .order('sort_order');
  if (error) throw error;
  return data.map((cat) => ({
    ...cat,
    products: (cat.products || []).filter((p) => p.is_active).sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export async function fetchCategories() {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return data;
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name)')
    .order('name');
  if (error) throw error;
  return data;
}

export async function createCategory({ name, sort_order = 0 }) {
  const { data, error } = await supabase.from('categories').insert({ name, sort_order }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id, updates) {
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function createProduct(payload) {
  const { data, error } = await supabase.from('products').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

/* ── Tables ── */

export async function getTableByToken(token) {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchTables() {
  const { data, error } = await supabase.from('tables').select('*').order('number');
  if (error) throw error;
  return data;
}

export async function createTable({ number }) {
  const { data, error } = await supabase.from('tables').insert({ number }).select().single();
  if (error) throw error;
  return data;
}

export async function updateTable(id, updates) {
  const { data, error } = await supabase.from('tables').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTable(id) {
  const { error } = await supabase.from('tables').delete().eq('id', id);
  if (error) throw error;
}

export function getClientUrl(token) {
  const url = new URL(appPath('/client.html'), window.location.origin);
  url.searchParams.set('table', token);
  return url.href;
}

/* ── Commandes ── */

export async function fetchOrders({ status = null, limit = 100 } = {}) {
  let query = supabase
    .from('orders')
    .select('*, tables(number), order_items(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchActiveOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, tables(number), order_items(*)')
    .in('status', [ORDER_STATUS.NEW, ORDER_STATUS.PREPARING, ORDER_STATUS.READY])
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select().single();
  if (error) throw error;
  return data;
}

export function subscribeToOrders(callback) {
  const channel = supabase
    .channel('orders-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function createOrder({ tableId, items }) {
  const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ table_id: tableId, status: ORDER_STATUS.NEW, total })
    .select()
    .single();
  if (orderError) throw orderError;
  const { error: itemsError } = await supabase.from('order_items').insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      product_name: item.product_name,
    }))
  );
  if (itemsError) throw itemsError;
  return order;
}
