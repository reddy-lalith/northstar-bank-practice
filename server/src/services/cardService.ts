import type { Card, CardNetwork, MaskedCard, Transaction } from '../models/types';
import { cardRepo } from '../repositories/cardRepo';
import { transactionRepo } from '../repositories/transactionRepo';
import { nowIso } from '../utils/dates';
import { notFound, unprocessable } from '../utils/errors';
import { newId } from '../utils/ids';
import { generateCardNumber, maskCardNumber } from '../utils/luhn';
import { toCents } from '../utils/money';
import { accountService } from './accountService';
import { auditService } from './auditService';

export interface NewVirtualCardInput {
  accountId: string;
  nickname: string;
  merchantLock?: string | null;
  singleUse?: boolean;
  /** Dollars. */
  spendLimit?: number | null;
}

export function toMasked(card: Card): MaskedCard {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { cardNumber, ...rest } = card;
  return { ...rest, maskedNumber: maskCardNumber(cardNumber) };
}

export function normalizeMerchant(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export const cardService = {
  list(userId: string): MaskedCard[] {
    return cardRepo.listByUser(userId).map(toMasked);
  },

  getOwned(userId: string, cardId: string): Card {
    const card = cardRepo.findById(cardId);
    if (!card || card.userId !== userId) throw notFound('Card');
    return card;
  },

  transactions(userId: string, cardId: string): Transaction[] {
    this.getOwned(userId, cardId);
    return transactionRepo.listByCard(cardId);
  },

  createVirtual(userId: string, input: NewVirtualCardInput): Card {
    const account = accountService.getOwned(userId, input.accountId);
    if (account.type === 'SAVINGS') {
      throw unprocessable('UNSUPPORTED_ACCOUNT', 'Virtual cards can only be issued on checking or credit accounts');
    }

    const network: CardNetwork = account.type === 'CREDIT' ? 'MASTERCARD' : 'VISA';
    const cardNumber = generateCardNumber(network);
    const now = new Date();

    const card = cardRepo.insert({
      id: newId('card'),
      userId,
      accountId: account.id,
      kind: 'VIRTUAL',
      network,
      cardNumber,
      last4: cardNumber.slice(-4),
      expMonth: now.getMonth() + 1,
      expYear: now.getFullYear() + 3,
      nickname: input.nickname.trim(),
      merchantLock: input.merchantLock?.trim() || null,
      singleUse: input.singleUse ?? false,
      spendLimitCents: input.spendLimit != null ? toCents(input.spendLimit) : null,
      status: 'ACTIVE',
      createdAt: nowIso(),
    });

    auditService.record(userId, 'VIRTUAL_CARD_CREATED', 'card', card.id, {
      merchantLock: card.merchantLock,
      singleUse: card.singleUse,
      spendLimitCents: card.spendLimitCents,
    });
    return card;
  },

  close(userId: string, cardId: string): Card {
    const card = this.getOwned(userId, cardId);
    if (card.status === 'CLOSED') return card;
    const closed = cardRepo.update({ ...card, status: 'CLOSED' });
    auditService.record(userId, 'CARD_CLOSED', 'card', card.id);
    return closed;
  },
};
