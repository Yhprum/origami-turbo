import { constants, Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const sqlite = new Database(Bun.env.DB, { create: true });
sqlite.exec("PRAGMA journal_mode = WAL;");
sqlite.fileControl(constants.SQLITE_FCNTL_PERSIST_WAL, 0);

export const db = drizzle(sqlite, { schema, logger: undefined });
export const closeDb = () => sqlite.close();
export const rawDb = sqlite;

export default db;
