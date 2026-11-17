import { clone, store } from '../db/store';
import type { User } from '../models/types';

export const userRepo = {
  insert(user: User): User {
    store.tables.users.set(user.id, clone(user));
    return clone(user);
  },

  findById(id: string): User | null {
    const u = store.tables.users.get(id);
    return u ? clone(u) : null;
  },

  findByEmail(email: string): User | null {
    const needle = email.trim().toLowerCase();
    for (const u of store.tables.users.values()) {
      if (u.email.toLowerCase() === needle) return clone(u);
    }
    return null;
  },
};
