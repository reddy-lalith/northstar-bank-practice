import { config } from '../config';

export type FraudDecision = { ok: true } | { ok: false; reason: 'FRAUD_REVIEW' | 'VELOCITY' };

/** cardId -> timestamps (ms) of recent authorization attempts. */
const attempts = new Map<string, number[]>();

export const fraudService = {
  evaluate(cardId: string, amountCents: number, now = Date.now()): FraudDecision {
    const windowStart = now - config.fraud.velocityWindowMs;
    const recent = (attempts.get(cardId) ?? []).filter((t) => t >= windowStart);
    recent.push(now);
    attempts.set(cardId, recent);

    if (recent.length > config.fraud.velocityMaxAttempts) {
      return { ok: false, reason: 'VELOCITY' };
    }
    if (amountCents > config.fraud.reviewThresholdCents) {
      return { ok: false, reason: 'FRAUD_REVIEW' };
    }
    return { ok: true };
  },

  reset(): void {
    attempts.clear();
  },
};
