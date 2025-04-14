import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "~/lib/server/db";
import { IdeaType } from "~/lib/server/db/enums";
import { formatBondIdeas } from "~/lib/server/formatters/bondsFormatter";
import { formatOptionIdeas } from "~/lib/server/formatters/optionIdeasFormatter";
import { formatStockIdeas } from "~/lib/server/formatters/stockIdeasFormatter";
import logger from "~/lib/server/logger";
import { serverFunctionStandardValidator } from "~/lib/utils/form";
import { authMiddleware } from "./middleware";

export const getStockIdeas = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const ideas = await db
      .selectFrom("Idea")
      .selectAll()
      .where("userId", "=", context.user.id)
      .where("type", "=", IdeaType.STOCK)
      .selectAll()
      .execute();

    const formattedIdeas = await formatStockIdeas(ideas);
    return formattedIdeas.sort((a, b) => a.symbol.localeCompare(b.symbol));
  });

export const createIdea = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      z.object({ type: z.nativeEnum(IdeaType), symbol: z.string() })
    )
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const format = getFormattingFuntion(data.type);
    const idea = await db
      .insertInto("Idea")
      .values({ symbol: data.symbol, type: data.type, userId: context.user.id })
      .returningAll()
      .executeTakeFirstOrThrow();
    const formattedIdea = await format([idea]);
    logger.info(
      `User ${context.user.id} has added ${data.type} idea for ${data.symbol}`
    );
    return formattedIdea[0];
  });

export const deleteIdea = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(z.number()))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    await db
      .deleteFrom("Idea")
      .where("id", "=", data)
      .where("userId", "=", context.user.id)
      .execute();
    return { ok: true };
  });

export const updateIdea = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      z.object({
        id: z.number(),
        field: z.string(),
        value: z.union([z.string(), z.number()]),
      })
    )
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    if (!["target", "notes", "tags"].includes(data.field))
      throw new Error("Invalid Field");
    await db
      .updateTable("Idea")
      .set({ [data.field]: data.value === "" ? null : data.value })
      .where("id", "=", data.id)
      .where("userId", "=", context.user.id)
      .execute();

    logger.info(
      `User ${context.user.id} has updated field ${data.field} for idea ${data.id}`
    );
    return { ok: true };
  });

function getFormattingFuntion(type: IdeaType) {
  switch (type) {
    case IdeaType.STOCK:
      return formatStockIdeas;
    case IdeaType.OPTION:
      return formatOptionIdeas;
    case IdeaType.BOND:
      return formatBondIdeas;
    default:
      throw new Error("Unknown Idea Type");
  }
}
