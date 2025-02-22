import type { EmailCallback, EmailProcessing } from './email-callbacks.types';
import { apiClient } from '../shared/http/api-client';
import { coerceDates } from '../shared/http/http-client.models';

export async function getEmailCallbacks() {
  const { emailCallbacks } = await apiClient<{ emailCallbacks: EmailCallback[] }>({
    path: '/api/email-callbacks',
    method: 'GET',
  });

  return {
    emailCallbacks: emailCallbacks.map(coerceDates),
  };
}

export async function createEmailCallback(emailCallback: {
  domain: string;
  username: string;
  allowedOrigins: string[];
  webhookUrl: string;
  webhookSecret?: string;
}) {
  const { emailCallback: createdEmailCallback } = await apiClient<{ emailCallback: EmailCallback }>({
    path: '/api/email-callbacks',
    method: 'POST',
    body: emailCallback,
  });

  return {
    emailCallback: coerceDates(createdEmailCallback),
  };
}

export async function updateEmailCallback({
  emailCallbackId,
  emailCallback,
}: {
  emailCallbackId: string;
  emailCallback: {
    isEnabled?: boolean;
    callbackUrl?: string;
    callbackSecret?: string;
    domain?: string;
    username?: string;
    allowedOrigins?: string[];
  };
}) {
  const { emailCallback: updatedEmailCallback } = await apiClient<{ emailCallback: EmailCallback }>({
    path: `/api/email-callbacks/${emailCallbackId}`,
    method: 'PUT',
    body: emailCallback,
  });

  return {
    emailCallback: coerceDates(updatedEmailCallback),
  };
}

export async function deleteEmailCallback({ emailCallbackId }: { emailCallbackId: string }) {
  await apiClient({
    path: `/api/email-callbacks/${emailCallbackId}`,
    method: 'DELETE',
  });
}

export async function getEmailCallback({ emailCallbackId }: { emailCallbackId: string }) {
  const { emailCallback } = await apiClient<{ emailCallback: EmailCallback }>({
    path: `/api/email-callbacks/${emailCallbackId}`,
    method: 'GET',
  });

  return {
    emailCallback: coerceDates(emailCallback),
  };
}

export async function getEmailProcessings({ emailCallbackId, pageIndex, pageSize }: { emailCallbackId: string; pageIndex: number; pageSize: number }) {
  const {
    emailProcessings,
    emailProcessingsCount,
    pageIndex: apiPageIndex,
    pageSize: apiPageSize,
  } = await apiClient<{
    emailProcessings: EmailProcessing[];
    emailProcessingsCount: number;
    pageIndex: number;
    pageSize: number;
  }>({
    path: `/api/email-callbacks/${emailCallbackId}/processings`,
    method: 'GET',
    query: { pageIndex, pageSize },
  });

  return {
    emailProcessings: emailProcessings.map(coerceDates),
    emailProcessingsCount,
    pageIndex: apiPageIndex,
    pageSize: apiPageSize,
  };
}
