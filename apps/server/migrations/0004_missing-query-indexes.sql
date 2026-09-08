CREATE INDEX `api_keys_user_id_index` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE INDEX `emails_callbacks_user_id_index` ON `emails_callbacks` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_processings_email_callback_id_user_id_created_at_index` ON `email_processings` (`email_callback_id`,`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `email_processings_user_id_index` ON `email_processings` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_accounts_user_id_index` ON `auth_accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_accounts_account_id_provider_id_index` ON `auth_accounts` (`account_id`,`provider_id`);--> statement-breakpoint
CREATE INDEX `auth_sessions_user_id_index` ON `auth_sessions` (`user_id`);