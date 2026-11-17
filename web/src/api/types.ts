export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT';
export type Category =
  | 'DINING'
  | 'GROCERIES'
  | 'TRAVEL'
  | 'SHOPPING'
  | 'ENTERTAINMENT'
  | 'UTILITIES'
  | 'TRANSPORT'
  | 'HEALTH'
  | 'OTHER';

export const CATEGORIES: Category[] = [
  'DINING',
  'GROCERIES',
  'TRAVEL',
  'SHOPPING',
  'ENTERTAINMENT',
  'UTILITIES',
  'TRANSPORT',
  'HEALTH',
  'OTHER',
];

export type TransactionType =
  | 'PURCHASE'
  | 'REFUND'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'PAYMENT'
  | 'BILL_PAY'
  | 'DEPOSIT'
  | 'INTEREST'
  | 'REWARD';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Account {
  id: string;
  type: AccountType;
  nickname: string;
  maskedNumber: string;
  balanceCents: number;
  availableCents: number;
  creditLimitCents: number | null;
  interestRateBps: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  direction: 'DEBIT' | 'CREDIT';
  amountCents: number;
  description: string;
  merchant: string | null;
  category: Category | null;
  cardId: string | null;
  status: 'POSTED' | 'PENDING';
  createdAt: string;
  accountNickname?: string;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type CardStatus = 'ACTIVE' | 'USED' | 'CLOSED';

export interface Card {
  id: string;
  accountId: string;
  kind: 'PHYSICAL' | 'VIRTUAL';
  network: 'VISA' | 'MASTERCARD';
  last4: string;
  maskedNumber?: string;
  cardNumber?: string;
  expMonth: number;
  expYear: number;
  nickname: string;
  merchantLock: string | null;
  singleUse: boolean;
  spendLimitCents: number | null;
  status: CardStatus;
  createdAt: string;
}

export interface Authorization {
  approved: boolean;
  reason: string | null;
  amountCents: number;
  cardId: string | null;
  transactionId: string | null;
}

export interface RewardsSummary {
  earnedCents: number;
  redeemedCents: number;
  availableCents: number;
  byCategory: { category: Category; spendCents: number; earnedCents: number; rateBps: number }[];
}

export interface Payee {
  id: string;
  name: string;
  accountLast4: string;
  category: Category;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}
