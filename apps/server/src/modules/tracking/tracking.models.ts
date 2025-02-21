import type { Context } from '../app/server.types';
import { createError } from '../shared/errors/errors';

export function getTrackingServices({ context }: { context: Context }) {
  const trackingServices = context.get('trackingServices');

  if (!trackingServices) {
    throw createError({
      message: 'Tracking services not found',
      code: 'tracking-services.not-found',
      statusCode: 500,
      isInternal: true,
    });
  }

  return { trackingServices };
}
