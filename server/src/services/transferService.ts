import { formatCents, toCents } from '../utils/money';
import { badRequest, unprocessable } from '../utils/errors';
import { newId } from '../utils/ids';
import { accountService, availableFunds } from './accountService';
import { auditService } from './auditService';
import { notificationService } from './notificationService';
import { transactionService } from './transactionService';

export interface TransferInput {
  fromAccountId: string;
  toAccountId: string;
  /** Dollars, up to 2 decimal places. */
  amount: number;
  memo?: string;
}

export interface TransferResult {
  transferId: string;
  amountCents: number;
  fromAccountId: string;
  toAccountId: string;
  fromBalanceCents: number;
  toBalanceCents: number;
  isCardPayment: boolean;
}

export const transferService = {
  transfer(userId: string, input: TransferInput): TransferResult {
    if (input.fromAccountId === input.toAccountId) {
      throw badRequest('SAME_ACCOUNT', 'Choose two different accounts');
    }

    const from = accountService.getOwned(userId, input.fromAccountId);
    const to = accountService.getOwned(userId, input.toAccountId);

    if (from.type === 'CREDIT') {
      throw unprocessable('UNSUPPORTED_SOURCE', 'Transfers out of a credit card are not supported');
    }

    const amountCents = toCents(input.amount);
    if (amountCents <= 0) {
      throw badRequest('INVALID_AMOUNT', 'Amount must be at least $0.01');
    }
    if (amountCents > availableFunds(from)) {
      throw unprocessable('INSUFFICIENT_FUNDS', `Only ${formatCents(availableFunds(from))} available`, {
        availableCents: availableFunds(from),
      });
    }

    const isCardPayment = to.type === 'CREDIT';
    if (isCardPayment && amountCents > to.balanceCents) {
      throw unprocessable('OVERPAYMENT', `Payment is more than the ${formatCents(to.balanceCents)} owed`, {
        owedCents: to.balanceCents,
      });
    }

    const transferId = newId('trf');
    const memo = input.memo?.trim();

    transactionService.record({
      accountId: from.id,
      type: 'TRANSFER_OUT',
      direction: 'DEBIT',
      amountCents,
      description: memo || (isCardPayment ? `Payment to ${to.nickname}` : `Transfer to ${to.nickname}`),
      merchant: null,
      category: null,
      cardId: null,
      transferId,
    });
    transactionService.record({
      accountId: to.id,
      type: isCardPayment ? 'PAYMENT' : 'TRANSFER_IN',
      direction: 'CREDIT',
      amountCents,
      description: memo || (isCardPayment ? `Payment from ${from.nickname}` : `Transfer from ${from.nickname}`),
      merchant: null,
      category: null,
      cardId: null,
      transferId,
    });

    const updatedFrom = accountService.debit(from.id, amountCents);
    const updatedTo = accountService.credit(to.id, amountCents);

    auditService.record(userId, isCardPayment ? 'CARD_PAYMENT' : 'TRANSFER', 'transfer', transferId, {
      fromAccountId: from.id,
      toAccountId: to.id,
      amountCents,
    });
    notificationService.notify(
      userId,
      `${formatCents(amountCents)} moved from ${from.nickname} to ${to.nickname}`,
    );

    return {
      transferId,
      amountCents,
      fromAccountId: from.id,
      toAccountId: to.id,
      fromBalanceCents: updatedFrom.balanceCents,
      toBalanceCents: updatedTo.balanceCents,
      isCardPayment,
    };
  },
};
