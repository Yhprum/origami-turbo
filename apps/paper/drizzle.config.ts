import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: you better have a db
    url: process.env.DB!,
  },
});
