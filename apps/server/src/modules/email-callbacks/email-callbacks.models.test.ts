import type { EmailCallback } from './email-callbacks.types';
import { describe, expect, test } from 'vitest';
import { formatEmailCallbackForApi, parseEmailAddress } from './email-callbacks.models';

describe('email-callbacks models', () => {
  describe('formatEmailCallbackForApi', () => {
    test('the webhook secret should not be disclosed, so it is replaced with fixed asterisks', () => {
      const emailCallback: EmailCallback = {
        id: '1',
        username: 'test',
        domain: 'test.com',
        webhookUrl: 'https://example.com/webhook',
        webhookSecret: '1234567890',
        allowedOrigins: [],
        isEnabled: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        userId: '1',
      };

      expect(formatEmailCallbackForApi({ emailCallback })).to.deep.equal({
        id: '1',
        username: 'test',
        domain: 'test.com',
        webhookUrl: 'https://example.com/webhook',
        hasWebhookSecret: true,
        allowedOrigins: [],
        isEnabled: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        userId: '1',
      });
    });

    test('the webhook secret is not redacted if it is not set', () => {
      expect(
        formatEmailCallbackForApi({ emailCallback: {
          id: '1',
          username: 'test',
          domain: 'test.com',
          webhookUrl: 'https://example.com/webhook',
          webhookSecret: null,
          allowedOrigins: [],
          isEnabled: true,
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
          userId: '1',
        } }),
      ).to.deep.equal({
        id: '1',
        username: 'test',
        domain: 'test.com',
        webhookUrl: 'https://example.com/webhook',
        hasWebhookSecret: false,
        allowedOrigins: [],
        isEnabled: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        userId: '1',
      });
    });
  });

  describe('parseEmailAddress', () => {
    test('extracts the username, domain and extra from an email address', () => {
      expect(
        parseEmailAddress({ emailAddress: 'test+extra@test.com' }),
      ).to.deep.equal({
        username: 'test',
        domain: 'test.com',
        extra: 'extra',
      });

      expect(
        parseEmailAddress({ emailAddress: 'test@test.com' }),
      ).to.deep.equal({
        username: 'test',
        domain: 'test.com',
        extra: undefined,
      });
    });
  });
});
