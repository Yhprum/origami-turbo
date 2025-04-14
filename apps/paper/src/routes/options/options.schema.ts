import { t } from "elysia";

export const optionsContractParams = t.Object({
  symbol: t.String({ description: "option contract symbol" }),
});

export const optionsParams = t.Object({
  symbol: t.String({ description: "stock symbol" }),
});

export const optionsDetailsParams = t.Object({
  symbol: t.String({ description: "stock symbol" }),
  expiration: t.Number({ description: "option expiration" }),
});
