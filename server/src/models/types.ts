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

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export type PublicUser = Omit<User, 'password'>;

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  nickname: string;
  accountNumber: string;
  /** Deposit accounts: funds on hand. CREDIT: amount owed. */
  balanceCents: number;
  creditLimitCents: number | null;
  interestRateBps: number;
  createdAt: string;
}

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

export const TRANSACTION_TYPES: TransactionType[] = [
  'PURCHASE',
  'REFUND',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'PAYMENT',
  'BILL_PAY',
  'DEPOSIT',
  'INTEREST',
  'REWARD',
];

/** DEBIT = money leaves the customer (or adds to a credit balance). CREDIT = the reverse. */
export type Direction = 'DEBIT' | 'CREDIT';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  direction: Direction;
  amountCents: number;
  description: string;
  merchant: string | null;
  category: Category | null;
  cardId: string | null;
  transferId: string | null;
  status: 'POSTED' | 'PENDING';
  createdAt: string;
}

export type CardStatus = 'ACTIVE' | 'USED' | 'CLOSED';
export type CardKind = 'PHYSICAL' | 'VIRTUAL';
export type CardNetwork = 'VISA' | 'MASTERCARD';

export interface Card {
  id: string;
  userId: string;
  accountId: string;
  kind: CardKind;
  network: CardNetwork;
  cardNumber: string;
  last4: string;
  expMonth: number;
  expYear: number;
  nickname: string;
  merchantLock: string | null;
  singleUse: boolean;
  spendLimitCents: number | null;
  status: CardStatus;
  createdAt: string;
}

export type MaskedCard = Omit<Card, 'cardNumber'> & { maskedNumber: string };

export interface Payee {
  id: string;
  userId: string;
  name: string;
  accountLast4: string;
  category: Category;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  accountId: string;
  amountCents: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
}
