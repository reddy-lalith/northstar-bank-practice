import type { AuditEvent } from '../models/types';
import { auditRepo } from '../repositories/auditRepo';
import { nowIso } from '../utils/dates';
import { newId } from '../utils/ids';
import { paginate, type Page, type PageParams } from '../utils/pagination';

export const auditService = {
  record(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, unknown> = {},
  ): AuditEvent {
    return auditRepo.insert({
      id: newId('aud'),
      userId,
      action,
      entityType,
      entityId,
      details,
      createdAt: nowIso(),
    });
  },

  list(userId: string, params: PageParams): Page<AuditEvent> {
    return paginate(auditRepo.listByUser(userId), params.page, params.pageSize);
  },
};
