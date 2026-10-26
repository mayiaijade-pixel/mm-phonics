CREATE TABLE `angel_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`week` text NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`position` integer NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `angel_login_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`failures` integer DEFAULT 0 NOT NULL,
	`locked_until` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `angel_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`student` text NOT NULL,
	`done` integer DEFAULT 0 NOT NULL,
	`upload_id` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `angel_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`student` text NOT NULL,
	`storage_key` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
