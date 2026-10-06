CREATE TABLE `lesson_progress` (
	`user_id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Jenny' NOT NULL,
	`step` integer DEFAULT 0 NOT NULL,
	`word` integer DEFAULT 0 NOT NULL,
	`quiz` integer DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`homework` text DEFAULT '[]' NOT NULL,
	`updated_at` text NOT NULL
);
