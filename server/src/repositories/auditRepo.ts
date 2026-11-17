import { clone, store } from '../db/store';
import type { AuditEvent } from '../models/types';
import { byNewest } from '../utils/dates';

export const auditRepo = {
  insert(event: AuditEvent): AuditEvent {
    store.tables.audit.set(event.id, clone(event));
    return clone(event);
  },

  listByUser(userId: string): AuditEvent[] {
    return [...store.tables.audit.values()]
      .filter((e) => e.userId === userId)
      .sort(byNewest)
      .map(clone);
  },
};
