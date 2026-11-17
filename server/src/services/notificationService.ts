import type { Notification } from '../models/types';
import { notificationRepo } from '../repositories/notificationRepo';
import { nowIso } from '../utils/dates';
import { newId } from '../utils/ids';

export const notificationService = {
  notify(userId: string, message: string): Notification {
    return notificationRepo.insert({
      id: newId('ntf'),
      userId,
      message,
      read: false,
      createdAt: nowIso(),
    });
  },

  list(userId: string): Notification[] {
    return notificationRepo.listByUser(userId);
  },
};
