import { createApiClient } from './api';
import { coerceDate } from './api.models';

export const OWLRELAY_API_BASE_URL = 'https://api.owlrelay.email';

 type AsDto<T> = {
   [K in keyof T]: T[K] extends Date ? string : T[K];
 };

export type OwlRelayEmail = {
  id: string;
  domain: string;
  username: string;
  webhookUrl: string;
  webhookSecret: string;
  isEnabled: boolean;
  allowedOrigins: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type OwlRelayEmailProcessing = {
  id: string;
  emailId: string;
  status: string;
  error?: string;
  fromAddress: string;
  subject: string;
  webhookUrl?: string;
  webhookResponseStatusCode?: number;

  createdAt: Date;
  updatedAt: Date;
};

export function createClient({
  apiKey,
  baseApiUrl = OWLRELAY_API_BASE_URL,
}: {
  apiKey: string;
  baseApiUrl?: string;
}) {
  const { apiClient } = createApiClient({ apiKey, baseApiUrl });

  const updateEmail = async ({ emailId, ...body }: { emailId: string } & Partial<Omit<OwlRelayEmail, 'id' | 'createdAt' | 'updatedAt'>>): Promise<OwlRelayEmail> => {
    const { emailCallback } = await apiClient<{ emailCallback: AsDto<OwlRelayEmail> }>(`/api/email-callbacks/${emailId}`, {
      method: 'PUT',
      body,
    });

    return coerceDate(emailCallback);
  };

  return {
    updateEmail,

    enableEmail: async ({ emailId }: { emailId: string }) => {
      return updateEmail({ emailId, isEnabled: true });
    },

    disableEmail: async ({ emailId }: { emailId: string }) => {
      return updateEmail({ emailId, isEnabled: false });
    },

    getEmails: async (): Promise<OwlRelayEmail[]> => {
      const { emailCallbacks } = await apiClient<{ emailCallbacks: AsDto<OwlRelayEmail>[] }>('/api/email-callbacks', {
        method: 'GET',
      });

      return emailCallbacks.map(coerceDate);
    },

    createEmail: async (body: {
      domain?: string;
      username: string;
      webhookUrl: string;
      webhookSecret?: string;
      allowedOrigins?: string[];
    }): Promise<OwlRelayEmail> => {
      const { emailCallback } = await apiClient<{ emailCallback: AsDto<OwlRelayEmail> }>('/api/email-callbacks', {
        method: 'POST',
        body,
      });

      return coerceDate(emailCallback);
    },

    deleteEmail: async ({ emailId }: { emailId: string }) => {
      return await apiClient<void>(`/api/email-callbacks/${emailId}`, {
        method: 'DELETE',
      });
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
