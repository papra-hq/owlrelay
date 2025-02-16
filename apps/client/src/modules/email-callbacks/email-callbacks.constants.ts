export const emailUsernameRegex = /^[a-z0-9]([\w\-.]*[a-z0-9])?$/i;

// Update also in server/src/modules/email-processings/email-processings.constants.ts
export const EMAIL_PROCESSING_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  NOT_PROCESSED: 'not-processed',
} as const;

export const EMAIL_PROCESSING_ERRORS = {
  FROM_ADDRESS_NOT_ALLOWED: 'from-address-not-allowed',
  WEBHOOK_FAILED: 'webhook-failed',
} as const;

export type EmailProcessingError = keyof typeof EMAIL_PROCESSING_ERRORS;
export type EmailProcessingErrorValue = (typeof EMAIL_PROCESSING_ERRORS)[EmailProcessingError];
