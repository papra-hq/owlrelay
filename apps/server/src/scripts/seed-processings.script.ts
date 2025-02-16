import { emailsCallbacksTable } from '../modules/email-callbacks/email-callbacks.table';
import { EMAIL_PROCESSING_ERRORS, EMAIL_PROCESSING_STATUS } from '../modules/email-processings/email-processings.constants';
import { emailProcessingsTable } from '../modules/email-processings/email-processings.table';
import { runScript } from './commons/run-script';

runScript(
  { scriptName: 'migrate-up' },
  async ({ db }) => {
    const emailCallbacks = await db.select().from(emailsCallbacksTable);

    for (const emailCallback of emailCallbacks) {
      const { id: emailCallbackId, userId, webhookUrl } = emailCallback;

      await db
        .insert(emailProcessingsTable)
        .values(
          [
            {
              emailCallbackId,
              userId,
              webhookUrl,
              status: EMAIL_PROCESSING_STATUS.SUCCESS,
              fromAddress: 'test@example.com',
              subject: 'Test',
              webhookResponseStatusCode: 200,
            },
            {
              emailCallbackId,
              userId,
              status: EMAIL_PROCESSING_STATUS.NOT_PROCESSED,
              error: EMAIL_PROCESSING_ERRORS.FROM_ADDRESS_NOT_ALLOWED,
              fromAddress: 'test@example.com',
              subject: 'Test',
            },
            {
              emailCallbackId,
              userId,
              webhookUrl,
              status: EMAIL_PROCESSING_STATUS.ERROR,
              error: EMAIL_PROCESSING_ERRORS.WEBHOOK_FAILED,
              fromAddress: 'test@example.com',
              subject: 'Test',
              webhookResponseStatusCode: 500,
            },
          ],
        );
    }
  },
);
