ALTER TABLE `users` RENAME COLUMN `name` TO `first_name`;--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `username` TO `surname`;--> statement-breakpoint
DROP INDEX IF EXISTS `users_username_unique`;