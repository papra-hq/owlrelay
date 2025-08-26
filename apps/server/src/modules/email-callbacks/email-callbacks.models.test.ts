import type { EmailCallback } from './email-callbacks.types';
import { describe, expect, test } from 'vitest';
import { checkEmailCallbackUsernameIsAllowed, filterEmailAddressesCandidates, formatEmailCallbackForApi, isEmailCallbackUsernameAllowed, parseEmailAddress } from './email-callbacks.models';

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
        webhookSecret: '************************',
        allowedOrigins: [],
        isEnabled: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        userId: '1',
      });
    });

    test('the webhook secret is not redacted if it is not set', () => {
      const emailCallback: EmailCallback = {
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
      };

      expect(formatEmailCallbackForApi({ emailCallback })).to.deep.equal({
        id: '1',
        username: 'test',
        domain: 'test.com',
        webhookUrl: 'https://example.com/webhook',
        webhookSecret: undefined,
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

  describe('isEmailCallbackUsernameAllowed', () => {
    test('some usernames are not allowed for security and impersonation reasons', () => {
      expect(isEmailCallbackUsernameAllowed({ username: 'admin' })).to.eql(false);
      expect(isEmailCallbackUsernameAllowed({ username: 'owlrelay' })).to.eql(false);

      expect(isEmailCallbackUsernameAllowed({ username: 'normal-user' })).to.eql(true);
    });
  });

  describe('checkEmailCallbackUsernameIsAllowed', () => {
    test('when the username is not allowed, an "username not allowed" error is thrown', () => {
      expect(() => checkEmailCallbackUsernameIsAllowed({ username: 'admin' })).to.throw('Email callback username not allowed');
      expect(() => checkEmailCallbackUsernameIsAllowed({ username: 'owlrelay' })).to.throw('Email callback username not allowed');

      expect(() => checkEmailCallbackUsernameIsAllowed({ username: 'normal-user' })).not.to.throw();
    });
  });

  describe('filterEmailAddressesCandidates', () => {
    test('given the list of receipient address, filters and parse only the ones matching the allowed domains and removes duplicates', () => {
      expect(filterEmailAddressesCandidates({
        emailAddresses: [
          'test@callback.email',
          'test@callback.email',
          'test-2@callback.email',
          'test-3+extra@callback.email',
          'unrelated@other-domain.com',
        ],
        allowedDomains: ['callback.email'],
      })).to.deep.equal({
        emailAddresses: [
          { username: 'test', domain: 'callback.email', extra: undefined },
          { username: 'test-2', domain: 'callback.email', extra: undefined },
          { username: 'test-3', domain: 'callback.email', extra: 'extra' },
        ],
      });
    });

    test('when the email addresses are empty, an empty array is returned', () => {
      expect(filterEmailAddressesCandidates({
        emailAddresses: [],
        allowedDomains: ['callback.email'],
      })).to.deep.equal({
        emailAddresses: [],
      });
    });
  });
});
