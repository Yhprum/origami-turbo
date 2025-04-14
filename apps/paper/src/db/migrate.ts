import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import db, { closeDb } from ".";

migrate(db, { migrationsFolder: "drizzle/migrations" });
closeDb();
