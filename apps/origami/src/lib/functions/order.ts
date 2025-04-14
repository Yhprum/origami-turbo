import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "~/lib/functions/middleware";
import {
  createOpenOrderSchema,
  updateOpenOrderSchema,
} from "~/lib/schemas/order";
import { db } from "~/lib/server/db";
import { TableName } from "~/lib/server/db/enums";
import { formatOpenOrders } from "~/lib/server/formatters/openOrders";
import logger from "~/lib/server/logger";
import { serverFunctionStandardValidator } from "~/lib/utils/form";

export const getOpenOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const columnPrefs = await db
      .selectFrom("ColumnStyle")
      .select("styles")
      .where("userId", "=", context.user.id)
      .where("table", "=", TableName.OPEN_ORDERS)
      .executeTakeFirst();

    const openOrders = await db
      .selectFrom("OpenOrder")
      .selectAll()
      .where("userId", "=", context.user.id)
      .execute();
    const formattedOpenOrders = await formatOpenOrders(openOrders);
    return {
      orders: formattedOpenOrders.sort((a, b) =>
        a.symbol.localeCompare(b.symbol)
      ),
      styles: columnPrefs?.styles,
    };
  });

export const createOpenOrder = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(createOpenOrderSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const openOrder = await db
      .insertInto("OpenOrder")
      .values({
        symbol: data.symbol,
        gtc: new Date(data.gtc),
        buy: data.buy === "Buy",
        ordertype: data.orderType,
        quantity: data.quantity,
        price: data.price,
        userId: context.user.id,
        holdingId: data.holding,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    const holding = await formatOpenOrders([openOrder]);
    logger.info(
      `User ${context.user.id} has added a ${data.orderType} ${data.buy} order ${openOrder.id} for ${data.symbol}`
    );
    return holding[0];
  });

export const updateOpenOrder = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(updateOpenOrderSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const openOrder = await db
      .updateTable("OpenOrder")
      .set({
        symbol: data.symbol,
        gtc: new Date(data.gtc),
        buy: data.buy === "Buy",
        ordertype: data.orderType,
        quantity: Number(data.quantity),
        price: Number(data.price),
        userId: context.user.id,
        holdingId: data.holding,
      })
      .where("id", "=", data.id)
      .where("userId", "=", context.user.id)
      .returningAll()
      .executeTakeFirstOrThrow();
    const holding = await formatOpenOrders([openOrder]);
    logger.info(
      `User ${context.user.id} has edited a ${data.orderType} ${data.buy} order ${openOrder.id} for ${data.symbol}`
    );
    return holding[0];
  });

export const deleteOpenOrder = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(z.number()))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    await db
      .deleteFrom("OpenOrder")
      .where("id", "=", data)
      .where("userId", "=", context.user.id)
      .execute();
    logger.info(`User ${context.user.id} has deleted open order ${data}`);
    return { ok: true };
  });
