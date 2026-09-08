import { createAuthClient } from 'better-auth/solid';
import { buildTimeConfig } from '../config/config';

const { useSession, signIn, signUp, signOut, forgetPassword, resetPassword, sendVerificationEmail } = createAuthClient({
  baseURL: buildTimeConfig.baseApiUrl,
});

export { forgetPassword, resetPassword, sendVerificationEmail, signIn, signOut, signUp, useSession };
