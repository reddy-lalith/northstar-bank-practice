import { clone, store } from '../db/store';
import type { Card } from '../models/types';
import { byNewest } from '../utils/dates';

export const cardRepo = {
  insert(card: Card): Card {
    store.tables.cards.set(card.id, clone(card));
    return clone(card);
  },

  update(card: Card): Card {
    if (!store.tables.cards.has(card.id)) {
      throw new Error(`cardRepo.update: unknown card ${card.id}`);
    }
    store.tables.cards.set(card.id, clone(card));
    return clone(card);
  },

  findById(id: string): Card | null {
    const c = store.tables.cards.get(id);
    return c ? clone(c) : null;
  },

  findByNumber(cardNumber: string): Card | null {
    for (const c of store.tables.cards.values()) {
      if (c.cardNumber === cardNumber) return clone(c);
    }
    return null;
  },

  listByUser(userId: string): Card[] {
    return [...store.tables.cards.values()]
      .filter((c) => c.userId === userId)
      .sort(byNewest)
      .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'PHYSICAL' ? -1 : 1))
      .map(clone);
  },
};
