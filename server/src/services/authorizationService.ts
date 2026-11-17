import type { Card, Category } from '../models/types';
import { accountRepo } from '../repositories/accountRepo';
import { cardRepo } from '../repositories/cardRepo';
import { formatCents, toCents } from '../utils/money';
import { accountService, availableFunds } from './accountService';
import { auditService } from './auditService';
import { normalizeMerchant } from './cardService';
import { fraudService } from './fraudService';
import { notificationService } from './notificationService';
import { transactionService } from './transactionService';

export interface AuthorizationRequest {
  cardNumber: string;
  merchant: string;
  /** Dollars. */
  amount: number;
  category?: Category;
}

export type DeclineReason =
  | 'CARD_NOT_FOUND'
  | 'CARD_INACTIVE'
  | 'MERCHANT_MISMATCH'
  | 'OVER_CARD_LIMIT'
  | 'INSUFFICIENT_FUNDS'
  | 'FRAUD_REVIEW'
  | 'VELOCITY';

export interface AuthorizationResult {
  approved: boolean;
  reason: DeclineReason | null;
  amountCents: number;
  cardId: string | null;
  transactionId: string | null;
}

function decline(reason: DeclineReason, amountCents: number, card: Card | null, merchant: string): AuthorizationResult {
  if (card) {
    auditService.record(card.userId, 'CARD_DECLINED', 'card', card.id, { reason, merchant, amountCents });
  }
  return { approved: false, reason, amountCents, cardId: card?.id ?? null, transactionId: null };
}

/**
 * Merchant-side authorization. Checks run cheapest-first; the first failure wins.
 */
export const authorizationService = {
  authorize(req: AuthorizationRequest): AuthorizationResult {
    const amountCents = toCents(req.amount);
    const card = cardRepo.findByNumber(req.cardNumber.replace(/\s+/g, ''));

    if (!card) return decline('CARD_NOT_FOUND', amountCents, null, req.merchant);
    if (card.status !== 'ACTIVE') return decline('CARD_INACTIVE', amountCents, card, req.merchant);

    if (card.merchantLock && normalizeMerchant(card.merchantLock) !== normalizeMerchant(req.merchant)) {
      return decline('MERCHANT_MISMATCH', amountCents, card, req.merchant);
    }

    if (card.spendLimitCents !== null && amountCents > card.spendLimitCents) {
      return decline('OVER_CARD_LIMIT', amountCents, card, req.merchant);
    }

    const account = accountRepo.findById(card.accountId);
    if (!account || amountCents > availableFunds(account)) {
      return decline('INSUFFICIENT_FUNDS', amountCents, card, req.merchant);
    }

    const fraud = fraudService.evaluate(card.id, amountCents);
    if (!fraud.ok) return decline(fraud.reason, amountCents, card, req.merchant);

    const tx = transactionService.record({
      accountId: account.id,
      type: 'PURCHASE',
      direction: 'DEBIT',
      amountCents,
      description: req.merchant.trim(),
      merchant: req.merchant.trim(),
      category: req.category ?? 'OTHER',
      cardId: card.id,
      transferId: null,
    });
    accountService.debit(account.id, amountCents);

    if (card.singleUse) {
      const consumed: Card = { ...card, status: 'USED' };
      auditService.record(card.userId, 'CARD_CONSUMED', 'card', consumed.id, { transactionId: tx.id });
    }

    auditService.record(card.userId, 'CARD_AUTHORIZED', 'card', card.id, {
      merchant: req.merchant,
      amountCents,
      transactionId: tx.id,
    });
    notificationService.notify(
      card.userId,
      `${formatCents(amountCents)} at ${req.merchant.trim()} on ${card.nickname} (••${card.last4})`,
    );

    return { approved: true, reason: null, amountCents, cardId: card.id, transactionId: tx.id };
  },
};
