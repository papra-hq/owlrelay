import type Stripe from 'stripe';
import type { Config } from '../config/config.types';
import { buildUrl, injectArguments } from '@corentinth/chisels';
import { createStripeClient } from './stripe.services';

export type PaymentServices = ReturnType<typeof createPaymentServices>;

export function createPaymentServices({ config }: { config: Config }) {
  const { stripeClient } = createStripeClient({ stripeApiSecretKey: config.stripe.apiSecretKey });

  return injectArguments(
    {
      createCustomer,
      createCheckoutUrl,
      parseWebhookEvent,
      getCustomerPortalUrl,
      getCheckoutSession,
    },
    { stripeClient, config },
  );
}

async function createCustomer({ stripeClient, email, userId }: { stripeClient: Stripe; email: string; userId: string }) {
  const customer = await stripeClient.customers.create({
    email,
    metadata: { userId },
  });

  const customerId = customer.id;

  return { customerId };
}

export async function createCheckoutUrl({
  stripeClient,
  customerId,
  priceId,
  config,
}: {
  stripeClient: Stripe;
  customerId: string;
  priceId: string;
  config: Config;
}) {
  const { baseUrl } = config.client;

  const successUrl = buildUrl({ baseUrl, path: '/checkout-success?sessionId={CHECKOUT_SESSION_ID}' });
  const cancelUrl = buildUrl({ baseUrl, path: '/checkout-cancel' });

  const session = await stripeClient.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { checkoutUrl: session.url };
}

async function parseWebhookEvent({ stripeClient, payload, secret, signature }: { stripeClient: Stripe; payload: any; secret: string; signature: string }) {
  const event = await stripeClient.webhooks.constructEventAsync(payload, signature, secret);

  return { event };
}

async function getCustomerPortalUrl({
  stripeClient,
  customerId,
  config,
  returnUrl = buildUrl({ baseUrl: config.client.baseUrl, path: '/settings/billing' }),
}: {
  stripeClient: Stripe;
  customerId: string;
  returnUrl?: string;
  config: Config;
}) {
  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return { portalUrl: session.url };
}

async function getCheckoutSession({ stripeClient, sessionId }: { stripeClient: Stripe; sessionId: string }) {
  const checkoutSession = await stripeClient.checkout.sessions.retrieve(sessionId);

  return { checkoutSession };
}
