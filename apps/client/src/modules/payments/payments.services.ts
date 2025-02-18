import { apiClient } from '../shared/http/api-client';

export async function getCheckoutUrl({ planId }: { planId: string }) {
  const { checkoutUrl } = await apiClient<{ checkoutUrl: string }>({
    method: 'POST',
    path: `/api/payments/checkout-session`,
    body: {
      planId,
    },
  });

  return { checkoutUrl };
}

export async function getCustomerPortalUrl() {
  const { portalUrl } = await apiClient<{ portalUrl: string }>({
    method: 'GET',
    path: '/api/payments/customer-portal',
  });

  return { portalUrl };
}

export async function getCheckoutSessionStatus({ sessionId }: { sessionId: string }) {
  const { isPaid, status } = await apiClient<{
    isPaid: boolean;
    status: string;
  }>({
    method: 'GET',
    path: `/api/payments/checkout-session/${sessionId}`,
  });

  return { isPaid, status };
}
