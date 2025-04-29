import { createServer } from './modules/app/server';
import { createEmailHandler } from './modules/email-callbacks/email-callbacks.usecases';
import { triggerCron } from './modules/tasks/tasks.services';

const { app } = createServer();

export default {
  fetch: app.fetch,
  email: createEmailHandler(),
  scheduled: triggerCron,
};
