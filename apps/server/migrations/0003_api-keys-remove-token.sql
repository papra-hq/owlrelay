DROP INDEX "emails_callbacks_domain_username_index";--> statement-breakpoint
DROP INDEX "email_processings_created_at_emailCallbackId_index";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "users_customer_id_unique";--> statement-breakpoint
DROP INDEX "users_email_index";--> statement-breakpoint
DROP INDEX "auth_sessions_token_index";--> statement-breakpoint
DROP INDEX "auth_verifications_identifier_index";--> statement-breakpoint
ALTER TABLE `api_keys` ALTER COLUMN "key_hash" TO "key_hash" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_hash_unique` ON `api_keys` (`key_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `emails_callbacks_domain_username_index` ON `emails_callbacks` (`domain`,`username`);--> statement-breakpoint
CREATE INDEX `email_processings_created_at_emailCallbackId_index` ON `email_processings` (`created_at`,`email_callback_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_customer_id_unique` ON `users` (`customer_id`);--> statement-breakpoint
CREATE INDEX `users_email_index` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `auth_sessions_token_index` ON `auth_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `auth_verifications_identifier_index` ON `auth_verifications` (`identifier`);--> statement-breakpoint
ALTER TABLE `api_keys` ALTER COLUMN "prefix" TO "prefix" text NOT NULL;--> statement-breakpoint
ALTER TABLE `api_keys` DROP COLUMN `token`;