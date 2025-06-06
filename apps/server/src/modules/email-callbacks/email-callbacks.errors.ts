import { createErrorFactory } from '../shared/errors/errors';

export const createEmailCallbackNotFoundError = createErrorFactory({
  message: 'Email callback not found',
  code: 'email_callback.not_found',
  statusCode: 404,
});

export const createInvalidEmailCallbackAddressError = createErrorFactory({
  message: 'Invalid email callback address',
  code: 'email_callback.invalid_address',
  statusCode: 400,
});

export const createEmailCallbackAlreadyExistsError = createErrorFactory({
  message: 'Email callback already exists',
  code: 'email_callback.already_exists',
  statusCode: 400,
});

export const createEmailCallbackUsernameNotAllowedError = createErrorFactory({
  message: 'Email callback username not allowed',
  code: 'email_callback.username_not_allowed',
  statusCode: 400,
});
