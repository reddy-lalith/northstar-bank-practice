import { Router } from 'express';
import { currentUserId } from '../middleware/auth';
import { transactionService } from '../services/transactionService';

export const transactionsRouter = Router();

transactionsRouter.get('/recent', (req, res) => {
  const limit = Math.min(25, Math.max(1, Number(req.query.limit ?? 5) || 5));
  res.json({ transactions: transactionService.recentForUser(currentUserId(req), limit) });
});
