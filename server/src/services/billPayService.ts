import type { Category, Payee } from '../models/types';
import { payeeRepo } from '../repositories/payeeRepo';
import { nowIso } from '../utils/dates';
import { notFound, unprocessable } from '../utils/errors';
import { newId } from '../utils/ids';
import { formatCents, toCents } from '../utils/money';
import { accountService, availableFunds } from './accountService';
import { auditService } from './auditService';
import { notificationService } from './notificationService';
import { transactionService } from './transactionService';

export interface NewPayeeInput {
  name: string;
  accountLast4: string;
  category: Category;
}

export interface BillPaymentInput {
  payeeId: string;
  fromAccountId: string;
  amount: number;
  memo?: string;
}

export const billPayService = {
  listPayees(userId: string): Payee[] {
    return payeeRepo.listByUser(userId);
  },

  addPayee(userId: string, input: NewPayeeInput): Payee {
    const payee = payeeRepo.insert({
      id: newId('pye'),
      userId,
      name: input.name.trim(),
      accountLast4: input.accountLast4,
      category: input.category,
      createdAt: nowIso(),
    });
    auditService.record(userId, 'PAYEE_ADDED', 'payee', payee.id, { name: payee.name });
    return payee;
  },

  pay(userId: string, input: BillPaymentInput) {
    const payee = payeeRepo.findById(input.payeeId);
    if (!payee || payee.userId !== userId) throw notFound('Payee');

    const from = accountService.getOwned(userId, input.fromAccountId);
    if (from.type !== 'CHECKING') {
      throw unprocessable('UNSUPPORTED_SOURCE', 'Bills can only be paid from checking');
    }

    const amountCents = toCents(input.amount);
    if (amountCents > availableFunds(from)) {
      throw unprocessable('INSUFFICIENT_FUNDS', `Only ${formatCents(availableFunds(from))} available`, {
        availableCents: availableFunds(from),
      });
    }

    const tx = transactionService.record({
      accountId: from.id,
      type: 'BILL_PAY',
      direction: 'DEBIT',
      amountCents,
      description: input.memo?.trim() || `Bill pay: ${payee.name}`,
      merchant: payee.name,
      category: payee.category,
      cardId: null,
      transferId: null,
    });
    const updated = accountService.debit(from.id, amountCents);

    auditService.record(userId, 'BILL_PAID', 'payee', payee.id, { amountCents, transactionId: tx.id });
    notificationService.notify(userId, `Paid ${formatCents(amountCents)} to ${payee.name}`);

    return { transaction: tx, balanceCents: updated.balanceCents };
  },
};
