import { createAuthClient } from 'better-auth/solid';
import { buildTimeConfig } from '../config/config';

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  forgetPassword,
  resetPassword,
  sendVerificationEmail,
} = createAuthClient({
  baseURL: buildTimeConfig.baseApiUrl,
});
