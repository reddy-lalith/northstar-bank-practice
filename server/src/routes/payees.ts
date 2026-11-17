import { Router } from 'express';
import { currentUserId } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { billPayService, type BillPaymentInput, type NewPayeeInput } from '../services/billPayService';
import { billPayBody, payeeBody } from './schemas';

export const payeesRouter = Router();

payeesRouter.get('/', (req, res) => {
  res.json({ payees: billPayService.listPayees(currentUserId(req)) });
});

payeesRouter.post('/', validateBody(payeeBody), (req, res) => {
  res.status(201).json({ payee: billPayService.addPayee(currentUserId(req), req.body as NewPayeeInput) });
});

payeesRouter.post('/pay', validateBody(billPayBody), (req, res) => {
  res.status(201).json(billPayService.pay(currentUserId(req), req.body as BillPaymentInput));
});
