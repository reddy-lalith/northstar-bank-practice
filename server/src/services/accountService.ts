import type { Account } from '../models/types';
import { accountRepo } from '../repositories/accountRepo';
import { notFound } from '../utils/errors';

export interface AccountView extends Account {
  availableCents: number;
  maskedNumber: string;
}

/** Spendable money: deposits on hand, or remaining credit line. */
export function availableFunds(account: Account): number {
  if (account.type === 'CREDIT') {
    return (account.creditLimitCents ?? 0) - account.balanceCents;
  }
  return account.balanceCents;
}

function toView(account: Account): AccountView {
  return {
    ...account,
    availableCents: availableFunds(account),
    maskedNumber: `••••${account.accountNumber.slice(-4)}`,
  };
}

export const accountService = {
  listForUser(userId: string): AccountView[] {
    return accountRepo.listByUser(userId).map(toView);
  },

  /** Throws 404 if the account doesn't exist or belongs to someone else. */
  getOwned(userId: string, accountId: string): Account {
    const account = accountRepo.findById(accountId);
    if (!account || account.userId !== userId) throw notFound('Account');
    return account;
  },

  getView(userId: string, accountId: string): AccountView {
    return toView(this.getOwned(userId, accountId));
  },

  /** Money out of a deposit account, or a new charge on a credit account. */
  debit(accountId: string, cents: number): Account {
    const account = accountRepo.findById(accountId);
    if (!account) throw notFound('Account');
    const next: Account = {
      ...account,
      balanceCents: account.type === 'CREDIT' ? account.balanceCents + cents : account.balanceCents - cents,
    };
    return accountRepo.update(next);
  },

  /** Money into a deposit account, or a payment/refund on a credit account. */
  credit(accountId: string, cents: number): Account {
    const account = accountRepo.findById(accountId);
    if (!account) throw notFound('Account');
    const next: Account = {
      ...account,
      balanceCents: account.type === 'CREDIT' ? account.balanceCents - cents : account.balanceCents + cents,
    };
    return accountRepo.update(next);
  },
};
