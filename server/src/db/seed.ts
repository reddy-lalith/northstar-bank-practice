import type { Account, Card, Category, Transaction } from '../models/types';
import { fraudService } from '../services/fraudService';
import { daysAgo } from '../utils/dates';
import { newId } from '../utils/ids';
import { generateCardNumber } from '../utils/luhn';
import { applyRateBps } from '../utils/money';
import { store } from './store';

export const DEMO = {
  email: 'alex@northstar.dev',
  password: 'password123',
  userId: 'usr_alex',
  checkingId: 'acc_checking',
  savingsId: 'acc_savings',
  creditId: 'acc_credit',
  debitCardId: 'card_debit',
  creditCardId: 'card_credit',
  netflixCardId: 'card_netflix',
  ticketsCardId: 'card_tickets',
  gymCardId: 'card_gym',
} as const;

/** Small deterministic PRNG so every boot produces the same data. */
function mulberry32(seedValue: number) {
  let a = seedValue;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface MerchantProfile {
  name: string;
  category: Category;
  min: number;
  max: number;
  weight: number;
}

const MERCHANTS: MerchantProfile[] = [
  { name: 'Blue Bottle Coffee', category: 'DINING', min: 4.5, max: 9, weight: 6 },
  { name: 'Chipotle', category: 'DINING', min: 9, max: 17, weight: 4 },
  { name: 'Sweetgreen', category: 'DINING', min: 12, max: 19, weight: 3 },
  { name: "Trader Joe's", category: 'GROCERIES', min: 24, max: 95, weight: 4 },
  { name: 'Whole Foods Market', category: 'GROCERIES', min: 30, max: 130, weight: 3 },
  { name: 'Shell', category: 'TRANSPORT', min: 35, max: 62, weight: 2 },
  { name: 'Uber', category: 'TRANSPORT', min: 11, max: 42, weight: 3 },
  { name: 'Amazon', category: 'SHOPPING', min: 14, max: 120, weight: 4 },
  { name: 'Target', category: 'SHOPPING', min: 18, max: 95, weight: 3 },
  { name: 'AMC Theatres', category: 'ENTERTAINMENT', min: 14, max: 32, weight: 1 },
  { name: 'CVS Pharmacy', category: 'HEALTH', min: 7, max: 40, weight: 2 },
];

type Event = { at: Date; apply: () => void };

export function seed() {
  store.reset();
  fraudService.reset();
  const rng = mulberry32(20261117);
  const t = store.tables;

  const pick = (): MerchantProfile => {
    const total = MERCHANTS.reduce((s, m) => s + m.weight, 0);
    let roll = rng() * total;
    for (const m of MERCHANTS) {
      roll -= m.weight;
      if (roll <= 0) return m;
    }
    return MERCHANTS[0];
  };
  const dollars = (min: number, max: number) => Math.round((min + rng() * (max - min)) * 100);

  const created = daysAgo(120).toISOString();
  t.users.set(DEMO.userId, {
    id: DEMO.userId,
    name: 'Alex Morgan',
    email: DEMO.email,
    password: DEMO.password,
    createdAt: created,
  });

  const accounts: Account[] = [
    {
      id: DEMO.checkingId,
      userId: DEMO.userId,
      type: 'CHECKING',
      nickname: 'Everyday Checking',
      accountNumber: '3310284821',
      balanceCents: 0,
      creditLimitCents: null,
      interestRateBps: 0,
      createdAt: created,
    },
    {
      id: DEMO.savingsId,
      userId: DEMO.userId,
      type: 'SAVINGS',
      nickname: 'High-Yield Savings',
      accountNumber: '3310299017',
      balanceCents: 0,
      creditLimitCents: null,
      interestRateBps: 425,
      createdAt: created,
    },
    {
      id: DEMO.creditId,
      userId: DEMO.userId,
      type: 'CREDIT',
      nickname: 'Northstar Rewards Card',
      accountNumber: '5520117734',
      balanceCents: 0,
      creditLimitCents: 800_000,
      interestRateBps: 2399,
      createdAt: created,
    },
  ];
  accounts.forEach((a) => t.accounts.set(a.id, a));

  const exp = { expMonth: 9, expYear: new Date().getFullYear() + 3 };
  const cards: Card[] = [
    {
      id: DEMO.debitCardId,
      userId: DEMO.userId,
      accountId: DEMO.checkingId,
      kind: 'PHYSICAL',
      network: 'VISA',
      cardNumber: generateCardNumber('VISA', rng),
      last4: '',
      ...exp,
      nickname: 'Debit card',
      merchantLock: null,
      singleUse: false,
      spendLimitCents: null,
      status: 'ACTIVE',
      createdAt: created,
    },
    {
      id: DEMO.creditCardId,
      userId: DEMO.userId,
      accountId: DEMO.creditId,
      kind: 'PHYSICAL',
      network: 'MASTERCARD',
      cardNumber: generateCardNumber('MASTERCARD', rng),
      last4: '',
      ...exp,
      nickname: 'Rewards card',
      merchantLock: null,
      singleUse: false,
      spendLimitCents: null,
      status: 'ACTIVE',
      createdAt: created,
    },
    {
      id: DEMO.netflixCardId,
      userId: DEMO.userId,
      accountId: DEMO.creditId,
      kind: 'VIRTUAL',
      network: 'MASTERCARD',
      cardNumber: generateCardNumber('MASTERCARD', rng),
      last4: '',
      ...exp,
      nickname: 'Netflix subscription',
      merchantLock: 'Netflix',
      singleUse: false,
      spendLimitCents: 2_500,
      status: 'ACTIVE',
      createdAt: daysAgo(90).toISOString(),
    },
    {
      id: DEMO.ticketsCardId,
      userId: DEMO.userId,
      accountId: DEMO.creditId,
      kind: 'VIRTUAL',
      network: 'MASTERCARD',
      cardNumber: generateCardNumber('MASTERCARD', rng),
      last4: '',
      ...exp,
      nickname: 'Concert tickets (one-time)',
      merchantLock: null,
      singleUse: true,
      spendLimitCents: 25_000,
      status: 'ACTIVE',
      createdAt: daysAgo(3).toISOString(),
    },
    {
      id: DEMO.gymCardId,
      userId: DEMO.userId,
      accountId: DEMO.creditId,
      kind: 'VIRTUAL',
      network: 'MASTERCARD',
      cardNumber: generateCardNumber('MASTERCARD', rng),
      last4: '',
      ...exp,
      nickname: 'Old gym membership',
      merchantLock: 'Planet Fitness',
      singleUse: false,
      spendLimitCents: null,
      status: 'CLOSED',
      createdAt: daysAgo(110).toISOString(),
    },
  ];
  cards.forEach((c) => t.cards.set(c.id, { ...c, last4: c.cardNumber.slice(-4) }));

  for (const p of [
    { name: 'Duke Energy', accountLast4: '4417', category: 'UTILITIES' as const },
    { name: 'Spectrum Internet', accountLast4: '9021', category: 'UTILITIES' as const },
    { name: 'State Farm', accountLast4: '3380', category: 'OTHER' as const },
  ]) {
    const id = newId('pye');
    t.payees.set(id, { id, userId: DEMO.userId, ...p, createdAt: created });
  }

  // --- Ledger -------------------------------------------------------------
  const events: Event[] = [];

  const post = (at: Date, tx: Omit<Transaction, 'id' | 'createdAt' | 'status'>) => {
    const id = newId('txn');
    t.transactions.set(id, { ...tx, id, status: 'POSTED', createdAt: at.toISOString() });
    const acct = t.accounts.get(tx.accountId)!;
    const outflow = tx.direction === 'DEBIT';
    const delta = acct.type === 'CREDIT' ? (outflow ? 1 : -1) : outflow ? -1 : 1;
    acct.balanceCents += delta * tx.amountCents;
  };

  const base = { merchant: null, category: null, cardId: null, transferId: null };

  const at = (days: number, hour: number, minute = 0) => daysAgo(days, hour, minute);
  const add = (when: Date, apply: () => void) => events.push({ at: when, apply });

  add(at(80, 9), () =>
    post(at(80, 9), { ...base, accountId: DEMO.checkingId, type: 'DEPOSIT', direction: 'CREDIT', amountCents: 420_000, description: 'Opening deposit' }),
  );
  add(at(80, 9, 5), () =>
    post(at(80, 9, 5), { ...base, accountId: DEMO.savingsId, type: 'DEPOSIT', direction: 'CREDIT', amountCents: 800_000, description: 'Opening deposit' }),
  );

  for (let d = 76; d >= 0; d -= 14) {
    add(at(d, 6), () =>
      post(at(d, 6), { ...base, accountId: DEMO.checkingId, type: 'DEPOSIT', direction: 'CREDIT', amountCents: 215_000, description: 'Acme Corp payroll' }),
    );
  }

  for (const d of [70, 40, 10]) {
    add(at(d, 10), () => {
      const transferId = newId('trf');
      post(at(d, 10), { ...base, transferId, accountId: DEMO.checkingId, type: 'TRANSFER_OUT', direction: 'DEBIT', amountCents: 30_000, description: 'Transfer to High-Yield Savings' });
      post(at(d, 10), { ...base, transferId, accountId: DEMO.savingsId, type: 'TRANSFER_IN', direction: 'CREDIT', amountCents: 30_000, description: 'Transfer from Everyday Checking' });
    });
  }

  for (const d of [52, 22]) {
    add(at(d, 11), () => {
      const owed = t.accounts.get(DEMO.creditId)!.balanceCents;
      if (owed <= 0) return;
      const transferId = newId('trf');
      post(at(d, 11), { ...base, transferId, accountId: DEMO.checkingId, type: 'TRANSFER_OUT', direction: 'DEBIT', amountCents: owed, description: 'Payment to Northstar Rewards Card' });
      post(at(d, 11), { ...base, transferId, accountId: DEMO.creditId, type: 'PAYMENT', direction: 'CREDIT', amountCents: owed, description: 'Payment from Everyday Checking' });
    });
  }

  for (const d of [62, 32, 2]) {
    add(at(d, 3), () => {
      const bal = t.accounts.get(DEMO.savingsId)!.balanceCents;
      const interest = Math.round(applyRateBps(bal, 425) / 12);
      post(at(d, 3), { ...base, accountId: DEMO.savingsId, type: 'INTEREST', direction: 'CREDIT', amountCents: interest, description: 'Interest paid' });
    });
  }

  for (const d of [65, 35, 5]) {
    add(at(d, 4), () =>
      post(at(d, 4), { ...base, accountId: DEMO.creditId, type: 'PURCHASE', direction: 'DEBIT', amountCents: 1_549, description: 'Netflix', merchant: 'Netflix', category: 'ENTERTAINMENT', cardId: DEMO.netflixCardId }),
    );
  }

  for (const [d, cents] of [[58, 11_240], [28, 9_817]] as const) {
    add(at(d, 8), () =>
      post(at(d, 8), { ...base, accountId: DEMO.checkingId, type: 'BILL_PAY', direction: 'DEBIT', amountCents: cents, description: 'Bill pay: Duke Energy', merchant: 'Duke Energy', category: 'UTILITIES' }),
    );
  }

  add(at(45, 15), () =>
    post(at(45, 15), { ...base, accountId: DEMO.creditId, type: 'PURCHASE', direction: 'DEBIT', amountCents: 31_240, description: 'Delta Air Lines', merchant: 'Delta Air Lines', category: 'TRAVEL', cardId: DEMO.creditCardId }),
  );

  for (let d = 75; d >= 1; d--) {
    const count = rng() < 0.3 ? 2 : rng() < 0.85 ? 1 : 0;
    for (let i = 0; i < count; i++) {
      const m = pick();
      const onCredit = rng() < 0.55;
      const hour = 8 + Math.floor(rng() * 12);
      const minute = Math.floor(rng() * 60);
      const cents = dollars(m.min, m.max);
      add(at(d, hour, minute), () =>
        post(at(d, hour, minute), {
          ...base,
          accountId: onCredit ? DEMO.creditId : DEMO.checkingId,
          type: 'PURCHASE',
          direction: 'DEBIT',
          amountCents: cents,
          description: m.name,
          merchant: m.name,
          category: m.category,
          cardId: onCredit ? DEMO.creditCardId : DEMO.debitCardId,
        }),
      );
    }
  }

  add(at(50, 13), () =>
    post(at(50, 13), { ...base, accountId: DEMO.creditId, type: 'REFUND', direction: 'CREDIT', amountCents: 2_499, description: 'Amazon refund', merchant: 'Amazon', category: 'SHOPPING', cardId: DEMO.creditCardId }),
  );
  add(at(20, 16), () =>
    post(at(20, 16), { ...base, accountId: DEMO.checkingId, type: 'REFUND', direction: 'CREDIT', amountCents: 1_800, description: 'Target refund', merchant: 'Target', category: 'SHOPPING', cardId: DEMO.debitCardId }),
  );

  // Today: keep these strictly in the past so they sort as the newest rows.
  const twoHoursAgo = new Date(Date.now() - 2 * 3_600_000);
  const fortyMinAgo = new Date(Date.now() - 40 * 60_000);
  add(twoHoursAgo, () =>
    post(twoHoursAgo, { ...base, accountId: DEMO.creditId, type: 'PURCHASE', direction: 'DEBIT', amountCents: 6_412, description: 'Whole Foods Market', merchant: 'Whole Foods Market', category: 'GROCERIES', cardId: DEMO.creditCardId }),
  );
  add(fortyMinAgo, () =>
    post(fortyMinAgo, { ...base, accountId: DEMO.checkingId, type: 'PURCHASE', direction: 'DEBIT', amountCents: 675, description: 'Blue Bottle Coffee', merchant: 'Blue Bottle Coffee', category: 'DINING', cardId: DEMO.debitCardId }),
  );

  events.sort((a, b) => a.at.getTime() - b.at.getTime()).forEach((e) => e.apply());

  const welcomeId = newId('ntf');
  t.notifications.set(welcomeId, {
    id: welcomeId,
    userId: DEMO.userId,
    message: 'Welcome back, Alex. Your statement for last month is ready.',
    read: false,
    createdAt: daysAgo(1, 9).toISOString(),
  });

  return {
    accounts: t.accounts.size,
    transactions: t.transactions.size,
    cards: t.cards.size,
    email: DEMO.email,
    password: DEMO.password,
  };
}
