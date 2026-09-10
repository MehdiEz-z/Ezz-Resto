import { ORDER_STATUS } from '../shared/supabase.js';

export const state = { orders: [] };

export const STATUS_FLOW = {
  [ORDER_STATUS.NEW]: ORDER_STATUS.PREPARING,
  [ORDER_STATUS.PREPARING]: ORDER_STATUS.READY,
  [ORDER_STATUS.READY]: ORDER_STATUS.SERVED,
};

export const STATUS_ACTION = {
  [ORDER_STATUS.NEW]: 'Commencer',
  [ORDER_STATUS.PREPARING]: 'Prête',
  [ORDER_STATUS.READY]: 'Servie',
};
