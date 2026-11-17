import { Router } from 'express';
import { currentUserId } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { transferService, type TransferInput } from '../services/transferService';
import { transferBody } from './schemas';

export const transfersRouter = Router();

transfersRouter.post('/', validateBody(transferBody), (req, res) => {
  const result = transferService.transfer(currentUserId(req), req.body as TransferInput);
  res.status(201).json({ transfer: result });
});
