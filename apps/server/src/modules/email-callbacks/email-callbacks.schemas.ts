import { regexes, z } from 'zod';
import { emailCallbackIdRegex } from './email-callbacks.constants';

export const emailCallbackIdSchema = z.string().regex(emailCallbackIdRegex);
export const permissiveEmailSchema = z.email({ pattern: regexes.rfc5322Email });

export const emailCallbackIdOrAddressSchema = z.union([emailCallbackIdSchema, z.email()]);

export const emailCallbackUsernameSchema = z
  .string()
  .regex(/^[a-z0-9]([\w\-.]*[a-z0-9])?$/i)
  .min(3)
  .max(64);

export const emailCallbackWebhookUrlSchema = z.url();
export const emailCallbackWebhookSecretSchema = z.string().min(16).max(128);
export const emailCallbackAllowedOriginsSchema = z.array(permissiveEmailSchema);

export function createEmailCallbackDomainSchema({ availableDomains }: { availableDomains: readonly string[] }) {
  return z.enum(availableDomains as [string, ...string[]]);
}
