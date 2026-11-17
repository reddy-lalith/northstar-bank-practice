import type {
  Account,
  AuditEvent,
  Card,
  Notification,
  Payee,
  RewardRedemption,
  Session,
  Transaction,
  User,
} from '../models/types';

export interface Tables {
  users: Map<string, User>;
  accounts: Map<string, Account>;
  transactions: Map<string, Transaction>;
  cards: Map<string, Card>;
  payees: Map<string, Payee>;
  audit: Map<string, AuditEvent>;
  redemptions: Map<string, RewardRedemption>;
  notifications: Map<string, Notification>;
  sessions: Map<string, Session>;
}

function emptyTables(): Tables {
  return {
    users: new Map(),
    accounts: new Map(),
    transactions: new Map(),
    cards: new Map(),
    payees: new Map(),
    audit: new Map(),
    redemptions: new Map(),
    notifications: new Map(),
    sessions: new Map(),
  };
}

class Store {
  tables: Tables = emptyTables();

  reset(): void {
    this.tables = emptyTables();
  }
}

export const store = new Store();

/** Repositories hand out copies so callers can't mutate stored rows by accident. */
export function clone<T>(value: T): T {
  return structuredClone(value);
}
