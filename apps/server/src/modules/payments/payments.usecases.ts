import type Stripe from 'stripe';
import type { PlansRepository } from '../plans/plans.respository';
import type { UsersRepository } from '../users/users.repository';
import type { PaymentServices } from './payments.services';
import { get } from 'lodash-es';
import { PLANS } from '../plans/plans.constants';

export async function getOrCreateCustomerId({
  userId,
  paymentServices,
  usersRepository,
}: {
  userId: string;
  paymentServices: PaymentServices;
  usersRepository: UsersRepository;
}) {
  const { user } = await usersRepository.getUserByIdOrThrow({ userId });

  if (user.customerId) {
    return {
      customerId: user.customerId,
    };
  }

  const { customerId } = await paymentServices.createCustomer({ email: user.email, userId });

  await usersRepository.saveUserCustomerId({ userId, customerId });

  return {
    customerId,
  };
}

export async function handleStripeWebhookEvent({
  event,
  usersRepository,
  plansRepository,
}: {
  event: Stripe.Event;
  paymentServices: PaymentServices;
  usersRepository: UsersRepository;
  plansRepository: PlansRepository;
}) {
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const priceId = get(event, 'data.object.items.data[0].price.id');
    const customerId = get(event, 'data.object.customer') as string;

    const { planId } = await plansRepository.getPlanByPriceId({ priceId });

    await usersRepository.saveUserPlanId({ customerId, planId });
    return;
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = get(event, 'data.object.customer') as string;

    await usersRepository.saveUserPlanId({ customerId, planId: PLANS.FREE.id });
  }
}
