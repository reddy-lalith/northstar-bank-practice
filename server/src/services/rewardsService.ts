import { config } from '../config';
import type { Category } from '../models/types';
import { accountRepo } from '../repositories/accountRepo';
import { rewardsRepo } from '../repositories/rewardsRepo';
import { transactionRepo } from '../repositories/transactionRepo';
import { nowIso } from '../utils/dates';
import { unprocessable } from '../utils/errors';
import { newId } from '../utils/ids';
import { applyRateBps, formatCents, sumCents } from '../utils/money';
import { accountService } from './accountService';
import { auditService } from './auditService';
import { notificationService } from './notificationService';
import { transactionService } from './transactionService';

/** Cashback rates in basis points. */
export const CASHBACK_RATES_BPS: Partial<Record<Category, number>> = {
  DINING: 300,
  GROCERIES: 200,
  TRAVEL: 200,
};
export const DEFAULT_CASHBACK_BPS = 100;

export function cashbackRate(category: Category | null): number {
  return (category && CASHBACK_RATES_BPS[category]) || DEFAULT_CASHBACK_BPS;
}

export interface RewardsSummary {
  earnedCents: number;
  redeemedCents: number;
  availableCents: number;
  byCategory: { category: Category; spendCents: number; earnedCents: number; rateBps: number }[];
}

export const rewardsService = {
  summary(userId: string): RewardsSummary {
    const creditAccounts = accountRepo.listByUser(userId).filter((a) => a.type === 'CREDIT');
    const txs = transactionRepo
      .listByAccounts(creditAccounts.map((a) => a.id))
      .filter((t) => t.type === 'PURCHASE' || t.type === 'REFUND');

    const byCategory = new Map<Category, { spendCents: number; earnedCents: number }>();
    for (const t of txs) {
      const category = t.category ?? 'OTHER';
      const sign = t.type === 'REFUND' ? -1 : 1;
      const row = byCategory.get(category) ?? { spendCents: 0, earnedCents: 0 };
      row.spendCents += sign * t.amountCents;
      row.earnedCents += sign * applyRateBps(t.amountCents, cashbackRate(category));
      byCategory.set(category, row);
    }

    const earnedCents = sumCents([...byCategory.values()].map((r) => r.earnedCents));
    const redeemedCents = sumCents(rewardsRepo.listRedemptions(userId).map((r) => r.amountCents));

    return {
      earnedCents,
      redeemedCents,
      availableCents: Math.max(0, earnedCents - redeemedCents),
      byCategory: [...byCategory.entries()]
        .map(([category, r]) => ({ category, ...r, rateBps: cashbackRate(category) }))
        .sort((a, b) => b.earnedCents - a.earnedCents),
    };
  },

  redeem(userId: string, accountId: string) {
    const account = accountService.getOwned(userId, accountId);
    if (account.type === 'CREDIT') {
      throw unprocessable('UNSUPPORTED_ACCOUNT', 'Redeem cashback into checking or savings');
    }
    const { availableCents } = this.summary(userId);
    if (availableCents < config.rewards.minRedemptionCents) {
      throw unprocessable('BELOW_MINIMUM', `You need at least ${formatCents(config.rewards.minRedemptionCents)} to redeem`);
    }

    const redemption = rewardsRepo.insertRedemption({
      id: newId('rdm'),
      userId,
      accountId,
      amountCents: availableCents,
      createdAt: nowIso(),
    });
    transactionService.record({
      accountId,
      type: 'REWARD',
      direction: 'CREDIT',
      amountCents: availableCents,
      description: 'Cashback redemption',
      merchant: null,
      category: null,
      cardId: null,
      transferId: null,
    });
    accountService.credit(accountId, availableCents);
    auditService.record(userId, 'REWARDS_REDEEMED', 'redemption', redemption.id, { amountCents: availableCents });
    notificationService.notify(userId, `${formatCents(availableCents)} cashback deposited to ${account.nickname}`);
    return redemption;
  },
};
