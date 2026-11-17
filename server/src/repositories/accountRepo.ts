import { clone, store } from '../db/store';
import type { Account } from '../models/types';

const TYPE_ORDER: Record<Account['type'], number> = { CHECKING: 0, SAVINGS: 1, CREDIT: 2 };

export const accountRepo = {
  insert(account: Account): Account {
    store.tables.accounts.set(account.id, clone(account));
    return clone(account);
  },

  update(account: Account): Account {
    if (!store.tables.accounts.has(account.id)) {
      throw new Error(`accountRepo.update: unknown account ${account.id}`);
    }
    store.tables.accounts.set(account.id, clone(account));
    return clone(account);
  },

  findById(id: string): Account | null {
    const a = store.tables.accounts.get(id);
    return a ? clone(a) : null;
  },

  listByUser(userId: string): Account[] {
    return [...store.tables.accounts.values()]
      .filter((a) => a.userId === userId)
      .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type])
      .map(clone);
  },
};
