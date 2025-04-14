ALTER TABLE `bonds` ADD `symbol` text NOT NULL;--> statement-breakpoint
ALTER TABLE `bonds` ADD `yield` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `bonds` ADD `lastSaleDate` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `bonds_symbol_unique` ON `bonds` (`symbol`);