import { clone, store } from '../db/store';
import type { Notification } from '../models/types';
import { byNewest } from '../utils/dates';

export const notificationRepo = {
  insert(n: Notification): Notification {
    store.tables.notifications.set(n.id, clone(n));
    return clone(n);
  },

  listByUser(userId: string, limit = 20): Notification[] {
    return [...store.tables.notifications.values()]
      .filter((n) => n.userId === userId)
      .sort(byNewest)
      .slice(0, limit)
      .map(clone);
  },
};
