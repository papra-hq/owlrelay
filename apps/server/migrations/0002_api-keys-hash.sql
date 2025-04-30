DROP INDEX `api_keys_token_unique`;--> statement-breakpoint
DROP INDEX `token_index`;--> statement-breakpoint
DROP INDEX "emails_callbacks_domain_username_index";--> statement-breakpoint
DROP INDEX "email_processings_created_at_emailCallbackId_index";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "users_customer_id_unique";--> statement-breakpoint
DROP INDEX "users_email_index";--> statement-breakpoint
DROP INDEX "auth_sessions_token_index";--> statement-breakpoint
DROP INDEX "auth_verifications_identifier_index";--> statement-breakpoint
ALTER TABLE `api_keys` ALTER COLUMN "token" TO "token" text;--> statement-breakpoint
CREATE UNIQUE INDEX `emails_callbacks_domain_username_index` ON `emails_callbacks` (`domain`,`username`);--> statement-breakpoint
CREATE INDEX `email_processings_created_at_emailCallbackId_index` ON `email_processings` (`created_at`,`email_callback_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_customer_id_unique` ON `users` (`customer_id`);--> statement-breakpoint
CREATE INDEX `users_email_index` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `auth_sessions_token_index` ON `auth_sessions` (`token`);--> statement-breakpoint
CREATE INDEX `auth_verifications_identifier_index` ON `auth_verifications` (`identifier`);--> statement-breakpoint
ALTER TABLE `api_keys` ADD `key_hash` text;--> statement-breakpoint
ALTER TABLE `api_keys` ADD `prefix` text;