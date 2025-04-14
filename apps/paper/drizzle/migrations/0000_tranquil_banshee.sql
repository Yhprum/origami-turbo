CREATE TABLE `bonds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`figi` text NOT NULL,
	`cusip` text NOT NULL,
	`name` text NOT NULL,
	`rate` integer NOT NULL,
	`price` integer NOT NULL,
	`standardAndPoorRating` text,
	`standardAndPoorChange` integer DEFAULT 0 NOT NULL,
	`moodyRating` text,
	`moodyChange` integer DEFAULT 0 NOT NULL,
	`fitchRating` text,
	`fitchChange` integer DEFAULT 0 NOT NULL,
	`maturityDate` integer NOT NULL,
	`callDate` integer,
	`type` text NOT NULL,
	`sector` text,
	`lastRatingUpdate` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bonds_figi_unique` ON `bonds` (`figi`);--> statement-breakpoint
CREATE UNIQUE INDEX `bonds_cusip_unique` ON `bonds` (`cusip`);--> statement-breakpoint
CREATE TABLE `dividends` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stockId` integer NOT NULL,
	`date` integer NOT NULL,
	`amount` integer NOT NULL,
	FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `options` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stockId` integer NOT NULL,
	`contractSymbol` text NOT NULL,
	`strike` integer NOT NULL,
	`expiry` integer NOT NULL,
	`type` text NOT NULL,
	`bid` integer NOT NULL,
	`ask` integer NOT NULL,
	`impliedVolatility` integer NOT NULL,
	`openInterest` integer NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `options_contractSymbol_unique` ON `options` (`contractSymbol`);--> statement-breakpoint
CREATE TABLE `splits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stockId` integer NOT NULL,
	`date` integer NOT NULL,
	`numerator` integer NOT NULL,
	`denominator` integer NOT NULL,
	FOREIGN KEY (`stockId`) REFERENCES `stocks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `stocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`figi` text,
	`symbol` text NOT NULL,
	`name` text,
	`type` text NOT NULL,
	`price` integer NOT NULL,
	`rate` integer,
	`fiftyTwoWeekHigh` integer,
	`fiftyTwoWeekLow` integer,
	`forwardPE` integer,
	`marketCap` integer,
	`dayChange` integer,
	`dayChangePercent` integer,
	`sector` text,
	`exDividendDate` integer,
	`earningsDate` integer,
	`optionExpirations` text,
	`marketIdentifierCode` text,
	`source` text NOT NULL,
	`lastOptionsUpdate` integer,
	`fetchedEvents` integer DEFAULT false NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stocks_symbol_unique` ON `stocks` (`symbol`);