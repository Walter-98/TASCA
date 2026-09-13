CREATE INDEX `idx_members_user` ON `account_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_members_email` ON `account_members` (`email`);--> statement-breakpoint
CREATE INDEX `idx_accounts_owner` ON `accounts` (`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_account_date` ON `movements` (`account_id`,`date`);--> statement-breakpoint
CREATE INDEX `idx_movements_to_account` ON `movements` (`to_account_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_owner` ON `movements` (`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_occurrences_recurring` ON `occurrences` (`recurring_id`);--> statement-breakpoint
CREATE INDEX `idx_recurring_account` ON `recurring` (`account_id`);