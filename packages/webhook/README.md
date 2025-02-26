# OwlRelay Webhook

This package contains the code to trigger and verify webhooks when an email is received.

## Installation

```bash
pnpm install @owlrelay/webhook
# or
npm install @owlrelay/webhook
# or
yarn add @owlrelay/webhook
```

## Usage

To trigger a webhook, you can use the `triggerWebhook` function.
```ts
import { triggerWebhook } from '@owlrelay/webhook';

await triggerWebhook({
  email: { /* ...*/},
  webhookUrl: 'https://my-app.invalid/webhook',
  webhookSecret: 'my-webhook-secret',
});
```

On the receiving end, you can verify the webhook by using the `verifySignature` function.

```ts
import { verifySignature } from '@owlrelay/webhook';

const isValid = verifySignature({
  signature: 'my-signature',
  bodyBuffer,
  secret: 'my-webhook-secret',
});
```
## License

This library is licensed under the AGPL-3.0 License. See the [LICENSE](./LICENSE) file for details.

## Credits

This project is crafted with ❤️ by [Corentin Thomasset](https://corentin.tech).
If you find this project helpful, please consider [supporting my work](https://buymeacoffee.com/cthmsst).
