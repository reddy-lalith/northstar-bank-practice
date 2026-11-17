import { clone, store } from '../db/store';
import type { Payee } from '../models/types';

export const payeeRepo = {
  insert(payee: Payee): Payee {
    store.tables.payees.set(payee.id, clone(payee));
    return clone(payee);
  },

  findById(id: string): Payee | null {
    const p = store.tables.payees.get(id);
    return p ? clone(p) : null;
  },

  listByUser(userId: string): Payee[] {
    return [...store.tables.payees.values()]
      .filter((p) => p.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(clone);
  },
};
