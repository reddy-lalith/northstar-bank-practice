import { Router } from 'express';
import { currentUserId, requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { authService } from '../services/authService';
import { loginBody } from './schemas';

export const authRouter = Router();

authRouter.post('/login', validateBody(loginBody), (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  res.json(authService.login(email, password));
});

authRouter.post('/logout', requireAuth, (req, res) => {
  const token = req.header('authorization')?.split(' ')[1];
  if (token) authService.logout(token);
  res.status(204).end();
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: authService.me(currentUserId(req)) });
});
