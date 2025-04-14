import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import env from "~/lib/env";
import type { DB } from "./schema";

pg.types.setTypeParser(pg.types.builtins.NUMERIC, Number.parseFloat);

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
});

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
});
