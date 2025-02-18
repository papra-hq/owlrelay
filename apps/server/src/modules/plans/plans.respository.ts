import type { Config } from '../config/config.types';
import { injectArguments } from '@corentinth/chisels';
import { PLANS } from './plans.constants';
import { createPlanNotFoundError, createPriceIdNotFoundError } from './plans.errors';

export type PlansRepository = ReturnType<typeof createPlansRepository>;

export function createPlansRepository({ config }: { config: Config }) {
  return injectArguments(
    {
      getPlanPriceId,
      getPlanByPriceId,
      getPlanMaxEmails,
    },
    { config },
  );
}

async function getPlanPriceId({ planId, config }: { planId: string; config: Config }) {
  const { proPlanPriceId } = config.stripe.plans;

  if (planId === PLANS.PRO.id) {
    return { priceId: proPlanPriceId };
  }

  throw createPriceIdNotFoundError();
}

async function getPlanByPriceId({ priceId, config }: { priceId: string; config: Config }) {
  const { proPlanPriceId } = config.stripe.plans;

  if (priceId === proPlanPriceId) {
    return { planId: PLANS.PRO.id };
  }

  throw createPlanNotFoundError();
}

async function getPlanMaxEmails({ planId }: { planId: string }) {
  if (planId === PLANS.PRO.id) {
    return { maxEmails: PLANS.PRO.maxEmails };
  }

  if (planId === PLANS.FREE.id) {
    return { maxEmails: PLANS.FREE.maxEmails };
  }

  throw createPlanNotFoundError();
}
