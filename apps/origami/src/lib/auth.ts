import { betterAuth } from "better-auth";
import pg from "pg";
import env from "./env";

export const auth = betterAuth({
  database: new pg.Pool({ connectionString: env.DATABASE_URL }),
  user: {
    modelName: "User",
    additionalFields: {
      cash: { type: "number", required: false },
      yield: { type: "number", required: false },
    },
    changeEmail: {
      enabled: true,
    },
  },
  session: { modelName: "Session" },
  account: { modelName: "Account" },
  verification: { modelName: "Verification" },
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    cookiePrefix: "origami",
    generateId: false,
  },
});
