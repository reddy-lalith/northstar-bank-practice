import { Router } from 'express';
import { currentUserId } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { auditService } from '../services/auditService';
import { authorizationService, type AuthorizationRequest } from '../services/authorizationService';
import { notificationService } from '../services/notificationService';
import { parsePageParams } from '../utils/pagination';
import { authorizeBody } from './schemas';

export const auditRouter = Router();
auditRouter.get('/', (req, res) => {
  res.json(auditService.list(currentUserId(req), parsePageParams(req.query)));
});

export const notificationsRouter = Router();
notificationsRouter.get('/', (req, res) => {
  res.json({ notifications: notificationService.list(currentUserId(req)) });
});

/** Merchant terminal simulator. Unauthenticated on purpose: merchants don't hold customer sessions. */
export const simulateRouter = Router();
simulateRouter.post('/authorize', validateBody(authorizeBody), (req, res) => {
  const result = authorizationService.authorize(req.body as AuthorizationRequest);
  res.status(result.approved ? 201 : 402).json({ authorization: result });
});
