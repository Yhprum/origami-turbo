import { t } from "elysia";

export const bondsParams = t.Object({
  cusip: t.String({ description: "bond cusip" }),
});

export const bondsQuery = t.Object({
  cusips: t.String({ description: "comma separated list of cusips" }),
});
