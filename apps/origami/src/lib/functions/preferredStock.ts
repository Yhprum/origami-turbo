import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "~/lib/functions/middleware";
import { db } from "~/lib/server/db";
import { IdeaType } from "~/lib/server/db/enums";
import { getPreferredStocks } from "~/lib/server/external/preferredStocksAPI";
import logger from "~/lib/server/logger";
import { serverFunctionStandardValidator } from "~/lib/utils/form";

export const getPreferredStockIdeas = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const ideas = await db
      .selectFrom("Idea")
      .selectAll()
      .where("userId", "=", context.user.id)
      .where("type", "=", IdeaType.PREFERRED_STOCK)
      .execute();
    return getPreferredStocks(ideas);
  });

export const addPreferredStockIdea = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(z.string()))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { user } = context;
    if (!user) throw new Error("Unauthenticated");

    await db
      .insertInto("Idea")
      .values({ symbol: data, type: IdeaType.PREFERRED_STOCK, userId: user.id })
      .execute();
    logger.info(`User ${user.id} has added a preferred stock idea for ${data}`);
  });

export const deletePreferredStockIdea = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(z.string()))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await db
      .deleteFrom("Idea")
      .where("userId", "=", context.user.id)
      .where("type", "=", IdeaType.PREFERRED_STOCK)
      .where("symbol", "=", data)
      .execute();
    logger.info(
      `User ${context.user.id} has deleted a preferred stock idea for ${data}`
    );
  });
