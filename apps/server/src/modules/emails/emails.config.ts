import type { ConfigDefinition } from 'figue';
import { z } from 'zod';

export const emailsConfig = {
  resendApiKey: {
    doc: 'The API key for Resend',
    schema: z.string(),
    default: 'set-me',
    env: 'RESEND_API_KEY',
  },
  fromEmail: {
    doc: 'The email address to send emails from',
    schema: z.string(),
    default: 'OwlRelay <auth@mail.owlrelay.email>',
    env: 'EMAILS_FROM_ADDRESS',
  },
  dryRun: {
    doc: 'Whether to run the email service in dry run mode',
    schema: z.boolean(),
    default: false,
    env: 'EMAILS_DRY_RUN',
  },
} as const satisfies ConfigDefinition;
