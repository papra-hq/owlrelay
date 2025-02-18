import { createErrorFactory } from '../shared/errors/errors';

export const createCustomerAlreadyHasSubscriptionError = createErrorFactory({
  message: 'Customer already has an active subscription',
  code: 'payment.customer_already_has_subscription',
  statusCode: 400,
});

export const createUserHasNoSubscriptionError = createErrorFactory({
  message: 'User does not have an active subscription',
  code: 'payment.user_has_no_subscription',
  statusCode: 400,
});

export const createInvalidWebhookPayloadError = createErrorFactory({
  message: 'Invalid webhook payload',
  code: 'payment.invalid_webhook_payload',
  statusCode: 400,
});
