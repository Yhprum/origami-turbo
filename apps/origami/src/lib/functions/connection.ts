import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";
import type { Insertable } from "kysely";
import type { CountryCode, Products } from "plaid";
import env from "~/lib/env";
import { authMiddleware } from "~/lib/functions/middleware";
import {
  type BrokerageHolding,
  type BrokerageHoldingList,
  importTransactions,
} from "~/lib/import";
import {
  createConnectionSchema,
  importFilesSchema,
} from "~/lib/schemas/connection";
import { db } from "~/lib/server/db";
import { ConnectionType } from "~/lib/server/db/enums";
import type { Transaction } from "~/lib/server/db/schema";
import logger from "~/lib/server/logger";
import { plaidClient } from "~/lib/server/plaid";
import { importHoldings } from "~/lib/server/plaid/import";
import { serverFunctionStandardValidator } from "~/lib/utils/form";

export const fetchConnections = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const connections = await db
      .selectFrom("Connection")
      .select(["id", "name", "type", "syncedAt"])
      .where("userId", "=", context.user.id)
      .execute();
    return { connections };
  });

export const importFilesToAccount = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(importFilesSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const item = await db
      .selectFrom("Connection")
      .selectAll()
      .where("id", "=", data.id)
      .where("userId", "=", context.user.id)
      .executeTakeFirstOrThrow();
    if (item.type === ConnectionType.PLAID) return;

    const connectedHoldings = await db
      .selectFrom("Holding")
      .select(["symbol", "id"])
      .where("connectionId", "=", data.id)
      .execute();
    const holdings = await importTransactions(data.files, item.type);

    const holdingsToAdd: BrokerageHoldingList = {};
    const existingHoldings: Record<
      string,
      BrokerageHolding & { holdingId: number }
    > = {};
    for (const holding of Object.values(holdings)) {
      const existingHolding = connectedHoldings.find(
        (connectedHolding) => connectedHolding.symbol === holding.symbol
      );
      if (existingHolding)
        existingHoldings[holding.symbol] = {
          ...holding,
          holdingId: existingHolding.id,
        };
      else holdingsToAdd[holding.symbol] = holding;
    }

    const transactionsToAdd: Insertable<Transaction>[] = [];

    if (Object.values(holdingsToAdd).length) {
      const holdingIds = await db
        .insertInto("Holding")
        .values(
          Object.values(holdings).map((holding) => ({
            symbol: holding.symbol,
            type: holding.type,
            closed: false,
            userId: context.user.id,
            connectionId: data.id,
          }))
        )
        .returning(["id", "symbol"])
        .execute();

      holdingIds.forEach(({ id, symbol }) =>
        transactionsToAdd.push(
          ...holdingsToAdd[symbol].transactions.map((transaction) => ({
            symbol,
            type: transaction.type,
            quantity: transaction.quantity,
            price: transaction.price,
            date: new Date(transaction.date),
            holdingId: id,
            userId: context.user.id,
          }))
        )
      );
    }

    Object.values(existingHoldings).forEach((holding) =>
      transactionsToAdd.push(
        ...holding.transactions.map((transaction) => ({
          symbol: holding.symbol,
          type: transaction.type,
          quantity: transaction.quantity,
          price: transaction.price,
          date: new Date(transaction.date),
          holdingId: holding.holdingId,
          userId: context.user.id,
        }))
      )
    );

    const result = await db
      .insertInto("Transaction")
      .values(transactionsToAdd)
      .returning("id")
      .execute();

    logger.info(
      `User ${context.user.id} imported ${result.length} transaction(s) to connection ${data.id}`
    );
    return result.length;
  });

export const deleteConnection = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(type({ id: "number" })))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const item = await db
      .selectFrom("Connection")
      .selectAll()
      .where("id", "=", data.id)
      .where("userId", "=", context.user.id)
      .executeTakeFirst();
    if (!item) return { ok: false };

    if (item.type === ConnectionType.PLAID && item.accessToken)
      await plaidClient.itemRemove({ access_token: item.accessToken });
    await db
      .deleteFrom("Holding")
      .where("connectionId", "=", data.id)
      .execute();
    await db.deleteFrom("Connection").where("id", "=", data.id).execute();
    return { ok: true };
  });

export const syncConnection = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(type({ id: "number" })))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const item = await db
      .selectFrom("Connection")
      .selectAll()
      .where("id", "=", data.id)
      .where("userId", "=", context.user.id)
      .executeTakeFirst();
    if (!item || item.type !== ConnectionType.PLAID) return { ok: false };

    const count = await importHoldings(context.user.id, item);
    await db
      .updateTable("Connection")
      .set("syncedAt", new Date())
      .where("id", "=", item.id)
      .execute();
    logger.info(
      `User ${context.user.id} imported ${count} transaction(s) to connection ${data.id}`
    );
    return { ok: true, count };
  });

export const createLinkToken = createServerFn({ method: "POST" }).handler(
  async () => {
    console.log(env.PLAID_CLIENT_ID, env.PLAID_SECRET, env.PLAID_ENV);
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: env.PLAID_CLIENT_ID },
      client_name: "Origami Placeholder",
      language: "en",
      products: ["auth", "investments"] as Products[],
      country_codes: ["US"] as CountryCode[],
      redirect_uri: env.PLAID_SANDBOX_REDIRECT_URI,
    });

    return tokenResponse.data;
  }
);

export const exchangePublicToken = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(type({ publicToken: "string" })))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: data.publicToken,
    });

    const info = await plaidClient.itemGet({
      access_token: exchangeResponse.data.access_token,
    });
    const name = info.data.item.institution_id
      ? (
          await plaidClient.institutionsGetById({
            institution_id: info.data.item.institution_id,
            country_codes: ["US"] as CountryCode[],
          })
        ).data.institution.name
      : "Untitled Account";

    await db
      .insertInto("Connection")
      .values({
        name,
        type: ConnectionType.PLAID,
        accessToken: exchangeResponse.data.access_token,
        itemId: exchangeResponse.data.item_id,
        userId: context.user.id,
      })
      .execute();
    logger.info(`User ${context.user.id} added account ${name}`);
    return { ok: true };
  });

export const createConnection = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(createConnectionSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const holdings = await importTransactions(data.files, data.accountType);

    const account = await db
      .insertInto("Connection")
      .values({
        name: data.accountName || "New Account",
        type: data.accountType,
        userId: context.user.id,
        syncedAt: new Date(),
      })
      .returning(["id", "name", "type", "syncedAt"])
      .executeTakeFirstOrThrow();

    if (Object.values(holdings).length === 0) return { account, count: 0 };

    const holdingIds = await db
      .insertInto("Holding")
      .values(
        Object.values(holdings).map((holding) => ({
          symbol: holding.symbol,
          type: holding.type,
          closed: false,
          userId: context.user.id,
          connectionId: account.id,
        }))
      )
      .returning(["id", "symbol"])
      .execute();

    const transactionsToAdd: Insertable<Transaction>[] = [];
    holdingIds.forEach(({ id, symbol }) => {
      transactionsToAdd.push(
        ...holdings[symbol].transactions.map((transaction) => ({
          symbol,
          type: transaction.type,
          quantity: transaction.quantity,
          price: transaction.price,
          date: new Date(transaction.date),
          holdingId: id,
          userId: context.user.id,
        }))
      );
    });

    const result = await db
      .insertInto("Transaction")
      .values(transactionsToAdd)
      .returning("id")
      .execute();

    logger.info(
      `User ${context.user.id} created new account ${account.id} with ${result.length} transaction(s)`
    );
    return { account, count: result.length };
  });
