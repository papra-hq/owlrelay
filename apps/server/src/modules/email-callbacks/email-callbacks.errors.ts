import { createErrorFactory } from '../shared/errors/errors';

export const emailCallbackNotFoundError = createErrorFactory({
  message: 'Email callback not found',
  code: 'email_callback.not_found',
  statusCode: 404,
});
