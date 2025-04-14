import { createServerFn } from "@tanstack/react-start";
import { logger } from "better-auth";
import { z } from "zod";
import { authMiddleware } from "~/lib/functions/middleware";
import { db } from "~/lib/server/db";
import { AssetClass, IdeaType } from "~/lib/server/db/enums";
import { formatBondIdeas } from "~/lib/server/formatters/bondsFormatter";
import paper from "~/lib/server/paper";
import { serverFunctionStandardValidator } from "~/lib/utils/form";

export const getBondIdeas = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const ideas = await db
      .selectFrom("Idea")
      .selectAll()
      .where("userId", "=", context.user.id)
      .where("type", "=", IdeaType.BOND)
      .selectAll()
      .execute();

    const formattedIdeas = await formatBondIdeas(ideas);
    return formattedIdeas.sort((a, b) => a.symbol.localeCompare(b.symbol));
  });

export const createBondIdea = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(z.string()))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    if (!data || !(await paper.bonds({ cusip: data }).get()).data)
      throw new Error("No bond data source was found for the given CUSIP");
    const idea = await db
      .insertInto("Idea")
      .values({ symbol: data, type: AssetClass.BOND, userId: context.user.id })
      .returningAll()
      .executeTakeFirstOrThrow();
    const formattedIdea = await formatBondIdeas([idea]);
    logger.info(`User ${context.user.id} has added a bond idea for ${data}`);
    return formattedIdea[0];
  });
