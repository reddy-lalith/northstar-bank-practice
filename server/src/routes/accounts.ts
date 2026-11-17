import { Router } from 'express';
import { currentUserId } from '../middleware/auth';
import type { TransactionType } from '../models/types';
import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import { parsePageParams } from '../utils/pagination';
import { transactionType } from './schemas';

export const accountsRouter = Router();

accountsRouter.get('/', (req, res) => {
  res.json({ accounts: accountService.listForUser(currentUserId(req)) });
});

accountsRouter.get('/:id', (req, res) => {
  res.json({ account: accountService.getView(currentUserId(req), req.params.id) });
});

accountsRouter.get('/:id/transactions', (req, res) => {
  const { page, pageSize } = parsePageParams(req.query);
  const type = req.query.type ? (transactionType.parse(req.query.type) as TransactionType) : undefined;
  res.json(transactionService.listForAccount(currentUserId(req), req.params.id, { page, pageSize, type }));
});
