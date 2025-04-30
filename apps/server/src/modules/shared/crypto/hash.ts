import { Buffer } from 'node:buffer';

export async function sha256(str: string, { digest = 'hex' }: { digest?: 'hex' | 'base64' | 'base64url' } = {}) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));

  return Buffer.from(hashBuffer).toString(digest);
}
