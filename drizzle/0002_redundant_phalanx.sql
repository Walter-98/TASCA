CREATE TABLE `account_members` (
	`account_id` text NOT NULL,
	`email` text NOT NULL,
	`user_id` text,
	PRIMARY KEY(`account_id`, `email`)
);
--> statement-breakpoint
CREATE TABLE `personal_budgets` (
	`owner_id` text NOT NULL,
	`month` text NOT NULL,
	`amount` integer NOT NULL,
	PRIMARY KEY(`owner_id`, `month`)
);
--> statement-breakpoint
CREATE TABLE `site_state` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD `owner_id` text;--> statement-breakpoint
ALTER TABLE `movements` ADD `owner_id` text;--> statement-breakpoint
ALTER TABLE `movements` ADD `author` text;--> statement-breakpoint
ALTER TABLE `movements` ADD `updated_by` text;--> statement-breakpoint
ALTER TABLE `recurring` ADD `owner_id` text;