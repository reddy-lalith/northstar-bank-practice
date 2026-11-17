export const config = {
  port: Number(process.env.PORT ?? 4000),
  env: process.env.NODE_ENV ?? 'development',
  logRequests: process.env.NODE_ENV !== 'test',
  sessionTtlHours: 12,
  fraud: {
    reviewThresholdCents: 500_000,
    velocityWindowMs: 60_000,
    velocityMaxAttempts: 5,
  },
  rewards: {
    minRedemptionCents: 100,
  },
};
