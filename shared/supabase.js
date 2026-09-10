import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://tozoeqoxtpsypljdpfld.supabase.co';
export const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvem9lcW94dHBzeXBsamRwZmxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjY1OTIsImV4cCI6MjEwNDYwMjU5Mn0.nnhu5ST1Xx1mm9yRcbdUkYu9Yen4HMAjrPmq_A6Z_lo';

export const ORDER_STATUS = {
  NEW: 'new',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
};

export const CART_STORAGE_KEY = 'resto_cart';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
