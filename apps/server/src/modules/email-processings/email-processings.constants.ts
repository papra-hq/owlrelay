// Update also in client/src/modules/email-callbacks/email-callbacks.constants.ts
export const EMAIL_PROCESSING_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  NOT_PROCESSED: 'not-processed',
} as const;

export const EMAIL_PROCESSING_ERRORS = {
  FROM_ADDRESS_NOT_ALLOWED: 'from-address-not-allowed',
  WEBHOOK_FAILED: 'webhook-failed',
} as const;
