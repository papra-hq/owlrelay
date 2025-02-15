import { z } from 'zod';
import { emailCallbackIdRegex } from './email-callbacks.constants';

export const emailCallbackIdSchema = z.string().regex(emailCallbackIdRegex);
