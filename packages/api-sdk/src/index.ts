import { createApiClient } from './api';
import { coerceDate, getEmailIdentifier } from './api.models';
import type { AsDto, OwlRelayEmail, OwlRelayEmailIdentifier, OwlRelayEmailProcessing, OwlRelayEmailUpdate } from './api.types';

export const OWLRELAY_API_BASE_URL = 'https://api.owlrelay.email';

export function createClient({ apiKey, baseApiUrl = OWLRELAY_API_BASE_URL }: { apiKey: string; baseApiUrl?: string }) {
  const { apiClient } = createApiClient({ apiKey, baseApiUrl });

  const updateEmail = async (identifier: OwlRelayEmailIdentifier, update: OwlRelayEmailUpdate): Promise<OwlRelayEmail> => {
    const { emailIdentifier } = getEmailIdentifier(identifier);

    const { emailCallback } = await apiClient<{ emailCallback: AsDto<OwlRelayEmail> }>(`/api/email-callbacks/${emailIdentifier}`, {
      method: 'PUT',
      body: update,
    });

    return coerceDate(emailCallback);
  };

  return {
    updateEmail,

    enableEmail: async (identifier: OwlRelayEmailIdentifier) => {
      return updateEmail(identifier, { isEnabled: true });
    },

    disableEmail: async (identifier: OwlRelayEmailIdentifier) => {
      return updateEmail(identifier, { isEnabled: false });
    },

    getEmails: async (): Promise<OwlRelayEmail[]> => {
      const { emailCallbacks } = await apiClient<{ emailCallbacks: AsDto<OwlRelayEmail>[] }>('/api/email-callbacks', {
        method: 'GET',
      });

      return emailCallbacks.map(coerceDate);
    },

    createEmail: async (body: { domain?: string; username: string; webhookUrl: string; webhookSecret?: string; allowedOrigins?: string[] }): Promise<OwlRelayEmail> => {
      const { emailCallback } = await apiClient<{ emailCallback: AsDto<OwlRelayEmail> }>('/api/email-callbacks', {
        method: 'POST',
        body,
      });

      return coerceDate(emailCallback);
    },

    deleteEmail: async (identifier: OwlRelayEmailIdentifier) => {
      const { emailIdentifier } = getEmailIdentifier(identifier);

      await apiClient(`/api/email-callbacks/${emailIdentifier}`, { method: 'DELETE' });
    },

    getEmail: async ({ emailId }: { emailId: string }): Promise<OwlRelayEmail> => {
      const { emailCallback } = await apiClient<{ emailCallback: AsDto<OwlRelayEmail> }>(`/api/email-callbacks/${emailId}`, {
        method: 'GET',
      });

      return coerceDate(emailCallback);
    },

    getEmailProcessings: async ({ emailId }: { emailId: string }): Promise<OwlRelayEmailProcessing[]> => {
      const { processings } = await apiClient<{ processings: AsDto<OwlRelayEmailProcessing>[] }>(`/api/email-callbacks/${emailId}/processings`, {
        method: 'GET',
      });

      return processings.map(coerceDate);
    },
  };
}
