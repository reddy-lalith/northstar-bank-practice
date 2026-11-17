import request from 'supertest';
import { createApp } from '../src/app';
import { DEMO, seed } from '../src/db/seed';

export function freshApp() {
  seed();
  return createApp();
}

export async function loginAs(app: ReturnType<typeof createApp>): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email: DEMO.email, password: DEMO.password });
  return res.body.token as string;
}

export { DEMO };
