# OwlRelay API SDK

This package is a TypeScript SDK for the [OwlRelay](https://owlrelay.email/) API.

## Prerequisites

You'll need an OwlRelay api key to use the SDK. You can get one by creating an account on [OwlRelay](https://app.owlrelay.email/register) and then creating an api key from the [OwlRelay api key page](https://app.owlrelay.email/api-keys).

## Installation

```bash
pnpm install @owlrelay/api-sdk
# or
npm install @owlrelay/api-sdk
# or
yarn add @owlrelay/api-sdk
```

## Usage

```ts
import { createClient } from '@owlrelay/api-sdk';

const client = createClient({ apiKey: 'your-owlrelay-api-key' });

const createdEmail = await client.createEmail({
  username: 'john.doe',
  webhookUrl: 'https://my-app.invalid/webhook',
  webhookSecret: 'my-webhook-secret',
});

console.log(createdEmail);
```

## API Reference

### createEmail

Create a new email address that will forward emails to a webhook.

```ts
const createdEmail = await client.createEmail({
  // The username of the email address.
  username: 'john.doe', 
  
  // The domain of the email address.
  // optional, defaults to 'callback.email'
  domain: 'callback.email',

  // Your webhook url.
  webhookUrl: 'https://my-app.invalid/webhook',

  // The webhook secret is used to HMAC-SHA256 sign the webhook request.
  // optional, defaults to a random secret
  webhookSecret: 'my-webhook-secret',

  // The allowed addresses that are allowed to trigger the webhook.
  // optional, defaults to [] (all addresses)
  allowedOrigins: ['foo@bar.com'],
});

console.log(createdEmail);
```

### getEmails

Get all email addresses that you have created.

```ts
const emails = await client.getEmails();

console.log(emails);
```

### getEmail

Get an email address by its id.

```ts
const email = await client.getEmail({ emailId: '...' });
```

### getEmailProcessings

Get all processings for an email address.

```ts
const processings = await client.getEmailProcessings({ emailId: '...' });
```

### disableEmail

Disable an email address. This will stop the email address from forwarding emails to your webhook.

```ts
const disabledEmail = await client.disableEmail({ emailId: '...' });
```

### enableEmail

Enable an email address.

```ts
const enabledEmail = await client.enableEmail({ emailId: '...' });
```

### deleteEmail

Delete an email address.

```ts
const deletedEmail = await client.deleteEmail({ emailId: '...' });
```

## License

This library is licensed under the AGPL-3.0 License. See the [LICENSE](./LICENSE) file for details.

## Credits

This project is crafted with ❤️ by [Corentin Thomasset](https://corentin.tech).
If you find this project helpful, please consider [supporting my work](https://buymeacoffee.com/cthmsst).
