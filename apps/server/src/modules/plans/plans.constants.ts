export const PLANS = {
  FREE: {
    id: 'free',
    maxEmails: 10,
    maxProcessingRetentionDays: 30,
  },
  PRO: {
    id: 'pro',
    maxEmails: 100,
    maxProcessingRetentionDays: 90,
  },
} as const;
