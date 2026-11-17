import { Router } from 'express';
import { currentUserId } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { rewardsService } from '../services/rewardsService';
import { redeemBody } from './schemas';

export const rewardsRouter = Router();

rewardsRouter.get('/summary', (req, res) => {
  res.json({ summary: rewardsService.summary(currentUserId(req)) });
});

rewardsRouter.post('/redeem', validateBody(redeemBody), (req, res) => {
  const redemption = rewardsService.redeem(currentUserId(req), (req.body as { accountId: string }).accountId);
  res.status(201).json({ redemption });
});
