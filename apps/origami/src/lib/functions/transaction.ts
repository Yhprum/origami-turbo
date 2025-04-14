import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "~/lib/schemas/transaction";
import { db } from "~/lib/server/db";
import type {
  FormattedBond,
  FormattedCoveredCall,
  FormattedStock,
} from "~/lib/server/formatters/types";
import logger from "~/lib/server/logger";
import { buildHolding } from "~/lib/server/utils/transactions";
import { serverFunctionStandardValidator } from "~/lib/utils/form";
import { authMiddleware } from "./middleware";

export const createTransaction = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(createTransactionSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const transaction = await db
      .insertInto("Transaction")
      .values({
        quantity: data.quantity,
        price: data.price,
        holdingId: data.holding,
        date: new Date(data.date),
        userId: context.user.id,
        symbol: data.symbol,
        type: data.type,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    if (data.closed) {
      await db
        .updateTable("Holding")
        .set({ closed: true })
        .where("id", "=", data.holding)
        .execute();
      return;
    }

    const holding = await buildHolding(transaction.holdingId);
    logger.info(
      `User ${context.user.id} has added transaction ${transaction.id} for holding ${data.holding}`
    );
    return holding;
  });

export const deleteTransaction = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      type({
        id: "number",
        "options?": type({ "build?": "boolean", "open?": "boolean" }),
      })
    )
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const transaction = await db
      .deleteFrom("Transaction")
      .where("id", "=", data.id)
      .where("userId", "=", context.user.id)
      .returning("holdingId")
      .executeTakeFirst();
    if (!transaction) throw new Error("No transaction to delete");

    logger.info(`User ${context.user.id} has deleted transaction ${data.id}`);

    if (data.options?.open) {
      await db
        .updateTable("Holding")
        .set({ closed: false })
        .where("id", "=", transaction.holdingId)
        .where("userId", "=", context.user.id)
        .execute();
    }
    if (!data.options?.build) return;

    const holding: FormattedBond | FormattedCoveredCall | FormattedStock =
      await buildHolding(transaction.holdingId);
    return holding;
  });

export const updateTransaction = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(updateTransactionSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    await db
      .updateTable("Transaction")
      .set({ [data.field]: data.value })
      .where("id", "=", data.id)
      .where("userId", "=", context.user.id)
      .execute();

    logger.info(
      `User ${context.user.id} has updated field ${data.field} for idea ${data.id}`
    );
    return { ok: true };
  });
