import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string(),
  CRON_TOKEN: z.string(),
  WEBSITE_URL: z.string().default("http://localhost:3000"),
  PAPER_API_URL: z.string().default("http://localhost:3001"),
  SUPPORT_EMAIL: z.string().email(),
  RESEND_API_KEY: z.string(),
  PLAID_CLIENT_ID: z.string(),
  PLAID_SECRET: z.string(),
  PLAID_SANDBOX_REDIRECT_URI: z.string().optional(),
  PLAID_ENV: z
    .union([z.literal("sandbox"), z.literal("production")])
    .default("sandbox"),
  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("test"),
      z.literal("production"),
    ])
    .default("development"),
});

const env =
  process.env.SKIP_VALIDATION === "true"
    ? (process.env as any)
    : envSchema.parse(process.env);

export default env as z.infer<typeof envSchema>;
