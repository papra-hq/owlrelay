import type { ServerInstance } from '../app/server.types';
import { get, pick } from 'lodash-es';
import { z } from 'zod';
import { getUser } from '../app/auth/auth.models';
import { getDb } from '../app/database/database.models';
import { getConfig } from '../config/config.models';
import { PLANS } from '../plans/plans.constants';
import { createPlansRepository } from '../plans/plans.respository';
import { getHeader } from '../shared/headers/headers.models';
import { createLogger } from '../shared/logger/logger';
import { validateJsonBody } from '../shared/validation/validation';
import { createUsersRepository } from '../users/users.repository';
import { createCustomerAlreadyHasSubscriptionError, createInvalidWebhookPayloadError } from './payments.errors';
import { getCheckoutSessionStatus } from './payments.models';
import { createPaymentServices } from './payments.services';
import { getOrCreateCustomerId, handleStripeWebhookEvent } from './payments.usecases';

const logger = createLogger({ namespace: 'payments.routes' });

export function registerPrivatePaymentsRoutes({ app }: { app: ServerInstance }) {
  setupCreateCheckoutSessionRoute({ app });
  setupGetCustomerPortalRoute({ app });
  setupCheckCheckoutSessionRoute({ app });
}

export function registerPublicPaymentsRoutes({ app }: { app: ServerInstance }) {
  setupStripeWebhookRoute({ app });
}

async function setupCreateCheckoutSessionRoute({ app }: { app: ServerInstance }) {
  app.post(
    '/api/payments/checkout-session',
    validateJsonBody(
      z.object({
        planId: z.enum([PLANS.PRO.id]),
      }),
    ),
    async (context) => {
      const { config } = getConfig({ context });
      const { db } = getDb({ context });
      const { userId } = getUser({ context });

      const usersRepository = createUsersRepository({ db });
      const plansRepository = createPlansRepository ({ config });
      const paymentServices = createPaymentServices({ config });

      const { planId } = context.req.valid('json');

      const { priceId } = await plansRepository.getPlanPriceId({ planId });

      const { user } = await usersRepository.getUserByIdOrThrow({ userId });

      if (user.planId !== PLANS.FREE.id) {
        throw createCustomerAlreadyHasSubscriptionError();
      }

      const { customerId } = await getOrCreateCustomerId({ userId, paymentServices, usersRepository });

      const { checkoutUrl } = await paymentServices.createCheckoutUrl({
        customerId,
        priceId,
      });

      return context.json({ checkoutUrl });
    },
  );
}

function setupStripeWebhookRoute({ app }: { app: ServerInstance }) {
  app.post('/api/payments/webhook', async (context) => {
    const { config } = getConfig({ context });
    const signature = getHeader({ context, name: 'stripe-signature' });
    const payload = await context.req.text();
    const { db } = getDb({ context });

    if (!signature) {
      throw createInvalidWebhookPayloadError();
    }

    const paymentServices = createPaymentServices({ config });
    const plansRepository = createPlansRepository({ config });
    const usersRepository = createUsersRepository({ db });

    const { event } = await paymentServices.parseWebhookEvent({ payload, secret: config.stripe.webhookSecret, signature });

    logger.info({
      event: pick(event, ['id', 'type']),
      customerId: get(event, 'data.object.customer'),
    }, 'Stripe webhook received');

    await handleStripeWebhookEvent({
      event,
      paymentServices,
      plansRepository,
      usersRepository,
    });

    return context.body(null, 204);
  });
}

function setupGetCustomerPortalRoute({ app }: { app: ServerInstance }) {
  app.get('/api/payments/customer-portal', async (context) => {
    const { db } = getDb({ context });
    const { config } = getConfig({ context });
    const { userId } = getUser({ context });

    const usersRepository = createUsersRepository({ db });
    const paymentServices = createPaymentServices({ config });

    const { customerId } = await getOrCreateCustomerId({ userId, paymentServices, usersRepository });

    const { portalUrl } = await paymentServices.getCustomerPortalUrl({ customerId });

    return context.json({ portalUrl });
  });
}

function setupCheckCheckoutSessionRoute({ app }: { app: ServerInstance }) {
  app.get('/api/payments/checkout-session/:sessionId', async (context) => {
    const { config } = getConfig({ context });
    const sessionId = context.req.param('sessionId');

    const paymentServices = createPaymentServices({ config });

    const { checkoutSession } = await paymentServices.getCheckoutSession({ sessionId });

    const { isPaid, status } = getCheckoutSessionStatus({ checkoutSession });

    return context.json({ isPaid, status });
  });
}
