import { z } from 'zod';
import { CATEGORIES, TRANSACTION_TYPES } from '../models/types';
import { hasAtMostTwoDecimals } from '../utils/money';

export const dollarAmount = z.coerce
  .number({ invalid_type_error: 'Amount must be a number' })
  .positive('Amount must be greater than 0')
  .max(1_000_000, 'Amount is too large')
  .refine(hasAtMostTwoDecimals, 'Use at most 2 decimal places');

export const category = z.enum(CATEGORIES as [string, ...string[]]);
export const transactionType = z.enum(TRANSACTION_TYPES as [string, ...string[]]);

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const transferBody = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: dollarAmount,
  memo: z.string().max(80).optional(),
});

export const virtualCardBody = z.object({
  accountId: z.string().min(1),
  nickname: z.string().trim().min(1).max(40),
  merchantLock: z.string().trim().max(60).nullish(),
  singleUse: z.boolean().optional(),
  spendLimit: dollarAmount.nullish(),
});

export const payeeBody = z.object({
  name: z.string().trim().min(1).max(60),
  accountLast4: z.string().regex(/^\d{4}$/, 'Last 4 digits'),
  category,
});

export const billPayBody = z.object({
  payeeId: z.string().min(1),
  fromAccountId: z.string().min(1),
  amount: dollarAmount,
  memo: z.string().max(80).optional(),
});

export const redeemBody = z.object({
  accountId: z.string().min(1),
});

export const authorizeBody = z.object({
  cardNumber: z.string().min(12),
  merchant: z.string().trim().min(1).max(60),
  amount: dollarAmount,
  category: category.optional(),
});
