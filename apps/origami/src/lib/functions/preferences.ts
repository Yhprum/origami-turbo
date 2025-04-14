import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "~/lib/functions/middleware";
import { db } from "~/lib/server/db";
import { TableName } from "~/lib/server/db/enums";
import { serverFunctionStandardValidator } from "~/lib/utils/form";

export const getColumnStyles = createServerFn({ method: "GET" })
  .validator(serverFunctionStandardValidator(z.nativeEnum(TableName)))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const columnStyle = await db
      .selectFrom("ColumnStyle")
      .select("styles")
      .where("userId", "=", context.user.id)
      .where("table", "=", data)
      .executeTakeFirst();
    return columnStyle?.styles;
  });

export const setColumnStyle = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      z.object({
        table: z.nativeEnum(TableName),
        styles: z.array(z.any()),
      })
    )
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    await db
      .insertInto("ColumnStyle")
      .values({
        table: data.table,
        styles: data.styles,
        userId: context.user.id,
      })
      .onConflict((oc) =>
        oc.column("table").column("userId").doUpdateSet({ styles: data.styles })
      )
      .execute();
  });
