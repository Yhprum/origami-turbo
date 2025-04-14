CREATE TABLE `tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`refreshToken` text NOT NULL,
	`expiresAt` integer NOT NULL
);
