import { createIdGenerator } from '@corentinth/friendly-ids';
import { generateRandomString } from '../shared/random/string';

export const generateEmailUsername = createIdGenerator();

export function generateEmailCallbackSecret() {
  return generateRandomString({ length: 42 });
}

export function formatEmailAddress({ username, domain }: { username: string; domain: string }) {
  return `${username}@${domain}`;
}
