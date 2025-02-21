import { createAuthClient } from 'better-auth/solid';
import { buildTimeConfig } from '../config/config';
import { trackingServices } from '../tracking/tracking.services';

const {
  useSession,
  signIn,
  signUp,
  signOut: signOutAuth,
  forgetPassword,
  resetPassword,
  sendVerificationEmail,
} = createAuthClient({
  baseURL: buildTimeConfig.baseApiUrl,
});

function signOut() {
  trackingServices.capture({ event: 'User logged out' });
  const result = signOutAuth();
  trackingServices.reset();

  return result;
}

export {
  forgetPassword,
  resetPassword,
  sendVerificationEmail,
  signIn,
  signOut,
  signUp,
  useSession,
};
