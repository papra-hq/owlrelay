import { createErrorFactory } from '../shared/errors/errors';

export const createPlanNotFoundError = createErrorFactory({
  message: 'Plan not found',
  statusCode: 404,
  code: 'plan.notFound',
});

export const createPriceIdNotFoundError = createErrorFactory({
  message: 'Price ID not found',
  statusCode: 404,
  code: 'priceId.notFound',
});
