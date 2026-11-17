import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../src/db/store';
import { DEMO, freshApp, loginAs } from './helpers';

const numberOf = (cardId: string) => store.tables.cards.get(cardId)!.cardNumber;

describe('virtual cards + authorization', () => {
  let app: ReturnType<typeof freshApp>;
  let token: string;
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const authorize = (cardNumber: string, merchant: string, amount: number) =>
    request(app).post('/api/simulate/authorize').send({ cardNumber, merchant, amount, category: 'ENTERTAINMENT' });

  beforeEach(async () => {
    app = freshApp();
    token = await loginAs(app);
  });

  it('masks card numbers in the list view', async () => {
    const res = await request(app).get('/api/cards').set(auth());
    expect(res.status).toBe(200);
    for (const card of res.body.cards) {
      expect(card.cardNumber).toBeUndefined();
      expect(card.maskedNumber).toMatch(/^•••• \d{4}$/);
    }
  });

  it('approves a merchant-locked card at its merchant, ignoring case', async () => {
    const res = await authorize(numberOf(DEMO.netflixCardId), 'NETFLIX', 15.49);
    expect(res.status).toBe(201);
    expect(res.body.authorization.approved).toBe(true);
  });

  it('declines a merchant-locked card anywhere else', async () => {
    const res = await authorize(numberOf(DEMO.netflixCardId), 'Hulu', 15.49);
    expect(res.status).toBe(402);
    expect(res.body.authorization.reason).toBe('MERCHANT_MISMATCH');
  });

  it('enforces the card spend limit', async () => {
    const res = await authorize(numberOf(DEMO.netflixCardId), 'Netflix', 40);
    expect(res.body.authorization.reason).toBe('OVER_CARD_LIMIT');
  });

  it('declines closed cards', async () => {
    const res = await authorize(numberOf(DEMO.gymCardId), 'Planet Fitness', 10);
    expect(res.body.authorization.reason).toBe('CARD_INACTIVE');
  });

  it('issues a new virtual card on the credit account', async () => {
    const res = await request(app)
      .post('/api/cards/virtual')
      .set(auth())
      .send({ accountId: DEMO.creditId, nickname: 'Spotify', merchantLock: 'Spotify', spendLimit: 15 });
    expect(res.status).toBe(201);
    expect(res.body.card.network).toBe('MASTERCARD');
    expect(res.body.card.spendLimitCents).toBe(1_500);
    expect(res.body.card.status).toBe('ACTIVE');
  });

  it('will not issue virtual cards on savings', async () => {
    const res = await request(app)
      .post('/api/cards/virtual')
      .set(auth())
      .send({ accountId: DEMO.savingsId, nickname: 'Nope' });
    expect(res.status).toBe(422);
  });
});
