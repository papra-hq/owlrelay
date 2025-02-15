import { createServer } from './modules/app/server';

const { app } = createServer();

export default {
  fetch: app.fetch,
};
