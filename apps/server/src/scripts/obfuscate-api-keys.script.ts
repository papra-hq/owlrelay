import { runScript } from './commons/run-script';
import { obfuscateApiKey } from './obfuscate-api-keys.usecases';

runScript(
  { scriptName: 'obfuscate-api-keys' },
  async ({ db }) => {
    await obfuscateApiKey({ db });
  },
);
