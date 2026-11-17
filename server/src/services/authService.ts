import type { PublicUser, User } from '../models/types';
import { sessionRepo } from '../repositories/sessionRepo';
import { userRepo } from '../repositories/userRepo';
import { unauthorized, notFound } from '../utils/errors';
import { auditService } from './auditService';

export function toPublicUser(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
}

export const authService = {
  login(email: string, password: string): { token: string; user: PublicUser } {
    const user = userRepo.findByEmail(email);
    // Demo app: plaintext passwords. Never do this in production.
    if (!user || user.password !== password) {
      throw unauthorized('Email or password is incorrect');
    }
    const session = sessionRepo.create(user.id);
    auditService.record(user.id, 'LOGIN', 'user', user.id);
    return { token: session.token, user: toPublicUser(user) };
  },

  logout(token: string): void {
    sessionRepo.delete(token);
  },

  me(userId: string): PublicUser {
    const user = userRepo.findById(userId);
    if (!user) throw notFound('User');
    return toPublicUser(user);
  },
};
