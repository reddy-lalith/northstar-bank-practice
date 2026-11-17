import type { Transaction, TransactionType } from '../models/types';
import { accountRepo } from '../repositories/accountRepo';
import { transactionRepo } from '../repositories/transactionRepo';
import { nowIso } from '../utils/dates';
import { newId } from '../utils/ids';
import { paginate, type Page, type PageParams } from '../utils/pagination';
import { accountService } from './accountService';

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'status'> & {
  createdAt?: string;
  status?: Transaction['status'];
};

export interface RecentTransaction extends Transaction {
  accountNickname: string;
}

export const transactionService = {
  record(input: NewTransaction): Transaction {
    const tx: Transaction = {
      status: 'POSTED',
      createdAt: nowIso(),
      ...input,
      id: newId('txn'),
    };
    return transactionRepo.insert(tx);
  },

  listForAccount(
    userId: string,
    accountId: string,
    params: PageParams & { type?: TransactionType },
  ): Page<Transaction> {
    accountService.getOwned(userId, accountId);
    const all = transactionRepo.listByAccount(accountId, { type: params.type });
    return paginate(all, params.page, params.pageSize);
  },

  recentForUser(userId: string, limit: number): RecentTransaction[] {
    const accounts = accountRepo.listByUser(userId);
    const names = new Map(accounts.map((a) => [a.id, a.nickname]));
    return transactionRepo
      .listByAccounts(accounts.map((a) => a.id))
      .slice(0, limit)
      .map((t) => ({ ...t, accountNickname: names.get(t.accountId) ?? 'Account' }));
  },
};
