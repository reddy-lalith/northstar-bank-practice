import { clone, store } from '../db/store';
import type { Transaction, TransactionType } from '../models/types';
import { byNewest } from '../utils/dates';

export interface TransactionFilter {
  type?: TransactionType;
}

export const transactionRepo = {
  insert(tx: Transaction): Transaction {
    store.tables.transactions.set(tx.id, clone(tx));
    return clone(tx);
  },

  findById(id: string): Transaction | null {
    const t = store.tables.transactions.get(id);
    return t ? clone(t) : null;
  },

  /** Newest first. */
  listByAccount(accountId: string, filter: TransactionFilter = {}): Transaction[] {
    return [...store.tables.transactions.values()]
      .filter((t) => t.accountId === accountId)
      .filter((t) => (filter.type ? t.type === filter.type : true))
      .sort(byNewest)
      .map(clone);
  },

  /** Newest first. */
  listByAccounts(accountIds: string[]): Transaction[] {
    const ids = new Set(accountIds);
    return [...store.tables.transactions.values()]
      .filter((t) => ids.has(t.accountId))
      .sort(byNewest)
      .map(clone);
  },

  /** Newest first. */
  listByCard(cardId: string): Transaction[] {
    return [...store.tables.transactions.values()]
      .filter((t) => t.cardId === cardId)
      .sort(byNewest)
      .map(clone);
  },
};
