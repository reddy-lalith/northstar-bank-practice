import { clone, store } from '../db/store';
import type { Session } from '../models/types';
import { nowIso } from '../utils/dates';
import { newToken } from '../utils/ids';

export const sessionRepo = {
  create(userId: string): Session {
    const session: Session = { token: newToken(), userId, createdAt: nowIso() };
    store.tables.sessions.set(session.token, session);
    return clone(session);
  },

  find(token: string): Session | null {
    const s = store.tables.sessions.get(token);
    return s ? clone(s) : null;
  },

  delete(token: string): void {
    store.tables.sessions.delete(token);
  },
};
