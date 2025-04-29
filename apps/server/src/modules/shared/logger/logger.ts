import { addLogContext, createAsyncContextPlugin, wrapWithLoggerContext } from '@crowlog/async-context-plugin';
import { createLoggerFactory, createStdoutLoggerTransport, type Logger } from '@crowlog/logger';

export type { Logger };
export { addLogContext, wrapWithLoggerContext };

export const createLogger = createLoggerFactory({
  plugins: [createAsyncContextPlugin()],
  // eslint-disable-next-line no-console
  transports: [createStdoutLoggerTransport({ writeToStdout: args => console.log(args) })],
});
