import { regexes, z } from 'zod';
import { emailCallbackIdRegex } from './email-callbacks.constants';

export const emailCallbackIdSchema = z.string().regex(emailCallbackIdRegex);
export const permissiveEmailSchema = z.email({ pattern: regexes.rfc5322Email });
