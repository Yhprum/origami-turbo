import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";
import { authMiddleware } from "~/lib/functions/middleware";
import { createIncomeSchema } from "~/lib/schemas/income";
import { db } from "~/lib/server/db";
import logger from "~/lib/server/logger";
import { serverFunctionStandardValidator } from "~/lib/utils/form";

export const createIncome = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(createIncomeSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const income = await db
      .insertInto("Income")
      .values({
        holdingId: data.holding,
        amount: data.amount,
        date: new Date(data.date),
        note: data.note,
        userId: context.user.id,
      })
      .returning("id")
      .executeTakeFirstOrThrow();
    logger.info(
      `User ${context.user.id} has added income ${income.id} of ${data.amount} for ${data.holding}`
    );
    return income.id;
  });

export const deleteIncome = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(type("number")))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    await db
      .deleteFrom("Income")
      .where("id", "=", data)
      .where("userId", "=", context.user.id)
      .execute();
    logger.info(`User ${context.user.id} has deleted income ${data}`);
    return { ok: true };
  });
