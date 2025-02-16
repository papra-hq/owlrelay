import { createServer } from './modules/app/server';
import { createEmailHandler } from './modules/email-callbacks/email-callbacks.usecases';

const { app } = createServer();

export default {
  fetch: app.fetch,
  email: createEmailHandler(),
};
