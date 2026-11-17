import express from 'express';
import { requireAuth } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { accountsRouter } from './routes/accounts';
import { authRouter } from './routes/auth';
import { cardsRouter } from './routes/cards';
import { auditRouter, notificationsRouter, simulateRouter } from './routes/misc';
import { payeesRouter } from './routes/payees';
import { rewardsRouter } from './routes/rewards';
import { transactionsRouter } from './routes/transactions';
import { transfersRouter } from './routes/transfers';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(requestLogger);

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRouter);
  app.use('/api/simulate', simulateRouter);

  const authed = express.Router();
  authed.use(requireAuth);
  authed.use('/accounts', accountsRouter);
  authed.use('/transactions', transactionsRouter);
  authed.use('/transfers', transfersRouter);
  authed.use('/cards', cardsRouter);
  authed.use('/rewards', rewardsRouter);
  authed.use('/payees', payeesRouter);
  authed.use('/audit', auditRouter);
  authed.use('/notifications', notificationsRouter);
  app.use('/api', authed);

  app.use('/api', notFoundHandler);
  app.use(errorHandler);
  return app;
}
