import type Stripe from 'stripe';

export function getCheckoutSessionStatus({ checkoutSession }: { checkoutSession: Stripe.Checkout.Session }) {
  const isPaid = checkoutSession.payment_status === 'paid';
  const status: 'complete' | 'expired' | 'open' | null = checkoutSession.status;

  return { isPaid, status };
}
