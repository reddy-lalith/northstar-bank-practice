import { clone, store } from '../db/store';
import type { RewardRedemption } from '../models/types';
import { byNewest } from '../utils/dates';

export const rewardsRepo = {
  insertRedemption(r: RewardRedemption): RewardRedemption {
    store.tables.redemptions.set(r.id, clone(r));
    return clone(r);
  },

  listRedemptions(userId: string): RewardRedemption[] {
    return [...store.tables.redemptions.values()]
      .filter((r) => r.userId === userId)
      .sort(byNewest)
      .map(clone);
  },
};
