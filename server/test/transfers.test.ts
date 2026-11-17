import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO, freshApp, loginAs } from './helpers';

describe('transfers API', () => {
  let app: ReturnType<typeof freshApp>;
  let token: string;
  const auth = () => ({ Authorization: `Bearer ${token}` });

  beforeEach(async () => {
    app = freshApp();
    token = await loginAs(app);
  });

  const balance = async (id: string) =>
    (await request(app).get(`/api/accounts/${id}`).set(auth())).body.account.balanceCents as number;

  it('moves money between checking and savings', async () => {
    const before = { chk: await balance(DEMO.checkingId), sav: await balance(DEMO.savingsId) };
    const res = await request(app)
      .post('/api/transfers')
      .set(auth())
      .send({ fromAccountId: DEMO.checkingId, toAccountId: DEMO.savingsId, amount: 100 });
    expect(res.status).toBe(201);
    expect(await balance(DEMO.checkingId)).toBe(before.chk - 10_000);
    expect(await balance(DEMO.savingsId)).toBe(before.sav + 10_000);
  });

  it('treats a transfer to the credit card as a payment', async () => {
    const owed = await balance(DEMO.creditId);
    const res = await request(app)
      .post('/api/transfers')
      .set(auth())
      .send({ fromAccountId: DEMO.checkingId, toAccountId: DEMO.creditId, amount: 50 });
    expect(res.status).toBe(201);
    expect(res.body.transfer.isCardPayment).toBe(true);
    expect(await balance(DEMO.creditId)).toBe(owed - 5_000);
  });

  it('rejects transfers larger than the available balance', async () => {
    const res = await request(app)
      .post('/api/transfers')
      .set(auth())
      .send({ fromAccountId: DEMO.savingsId, toAccountId: DEMO.checkingId, amount: 999_999 });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('INSUFFICIENT_FUNDS');
  });

  it('rejects same-account transfers and bad amounts', async () => {
    const same = await request(app)
      .post('/api/transfers')
      .set(auth())
      .send({ fromAccountId: DEMO.checkingId, toAccountId: DEMO.checkingId, amount: 10 });
    expect(same.status).toBe(400);

    const decimals = await request(app)
      .post('/api/transfers')
      .set(auth())
      .send({ fromAccountId: DEMO.checkingId, toAccountId: DEMO.savingsId, amount: 10.555 });
    expect(decimals.status).toBe(400);
  });
});
