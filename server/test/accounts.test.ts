import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO, freshApp, loginAs } from './helpers';

describe('accounts API', () => {
  let app: ReturnType<typeof freshApp>;
  let token: string;

  beforeEach(async () => {
    app = freshApp();
    token = await loginAs(app);
  });

  it('rejects requests without a session', async () => {
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(401);
  });

  it('lists the demo accounts in a stable order', async () => {
    const res = await request(app).get('/api/accounts').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.accounts.map((a: { type: string }) => a.type)).toEqual(['CHECKING', 'SAVINGS', 'CREDIT']);
  });

  it('reports available credit for credit accounts', async () => {
    const res = await request(app).get(`/api/accounts/${DEMO.creditId}`).set('Authorization', `Bearer ${token}`);
    const { account } = res.body;
    expect(account.availableCents).toBe(account.creditLimitCents - account.balanceCents);
  });

  it('returns paging metadata for transaction history', async () => {
    const res = await request(app)
      .get(`/api/accounts/${DEMO.checkingId}/transactions?pageSize=5`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(5);
    expect(res.body.totalPages).toBe(Math.ceil(res.body.total / 5));
  });

  it("does not expose another customer's account", async () => {
    const res = await request(app).get('/api/accounts/acc_someone_else').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
