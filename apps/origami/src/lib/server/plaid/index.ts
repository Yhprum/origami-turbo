import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";
import env from "~/lib/env";

export const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[env.PLAID_ENV],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": env.PLAID_CLIENT_ID,
        "PLAID-SECRET": env.PLAID_SECRET,
        "Plaid-Version": "2020-09-14",
      },
    },
  })
);
