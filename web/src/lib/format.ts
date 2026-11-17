import type { Category, Transaction, TransactionType } from '../api/types';

export function formatCents(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  return `${sign}$${(Math.abs(cents) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export const TYPE_LABEL: Record<TransactionType, string> = {
  PURCHASE: 'Purchase',
  REFUND: 'Refund',
  TRANSFER_IN: 'Transfer in',
  TRANSFER_OUT: 'Transfer out',
  PAYMENT: 'Payment',
  BILL_PAY: 'Bill pay',
  DEPOSIT: 'Deposit',
  INTEREST: 'Interest',
  REWARD: 'Cashback',
};

export function categoryLabel(c: Category | null): string {
  return c ? titleCase(c) : '';
}

/** Signed amount from the customer's point of view: money in is positive. */
export function signedAmount(tx: Transaction): number {
  return tx.direction === 'CREDIT' ? tx.amountCents : -tx.amountCents;
}

export function toDollars(input: string): number {
  return Number(input.replace(/[$,\s]/g, ''));
}
