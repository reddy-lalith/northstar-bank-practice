import { Router } from 'express';
import { currentUserId } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { cardService, type NewVirtualCardInput } from '../services/cardService';
import { virtualCardBody } from './schemas';

export const cardsRouter = Router();

cardsRouter.get('/', (req, res) => {
  res.json({ cards: cardService.list(currentUserId(req)) });
});

cardsRouter.post('/virtual', validateBody(virtualCardBody), (req, res) => {
  const card = cardService.createVirtual(currentUserId(req), req.body as NewVirtualCardInput);
  res.status(201).json({ card });
});

cardsRouter.get('/:id', (req, res) => {
  res.json({ card: cardService.getOwned(currentUserId(req), req.params.id) });
});

cardsRouter.get('/:id/transactions', (req, res) => {
  res.json({ transactions: cardService.transactions(currentUserId(req), req.params.id) });
});

cardsRouter.post('/:id/close', (req, res) => {
  res.json({ card: cardService.close(currentUserId(req), req.params.id) });
});
