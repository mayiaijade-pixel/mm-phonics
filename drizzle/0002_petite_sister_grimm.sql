CREATE TABLE `mimi_voice_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`audio` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
