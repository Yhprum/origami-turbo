import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";
import { authMiddleware } from "~/lib/functions/middleware";
import { db } from "~/lib/server/db";
import { withTags } from "~/lib/server/db/helpers";
import { serverFunctionStandardValidator } from "~/lib/utils/form";

export const getTags = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return await db
      .selectFrom("Tag")
      .selectAll()
      .where("userId", "=", context.user.id)
      .execute();
  });

export const getLabels = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const holdings = await db
      .selectFrom("Holding")
      .select(["id", "type", "symbol", "name", "category", "closed"])
      .select(withTags)
      .where("userId", "=", context.user.id)
      .execute();

    const tags = await db
      .selectFrom("Tag")
      .selectAll()
      .where("userId", "=", context.user.id)
      .execute();

    return { holdings, tags };
  });

export const createTag = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(type({ "name?": "string" })))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    return await db
      .insertInto("Tag")
      .values({ name: data.name, userId: context.user.id })
      .returningAll()
      .executeTakeFirstOrThrow();
  });

export const deleteTag = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(type({ id: "number" })))
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    await db
      .deleteFrom("Tag")
      .where("id", "=", data.id)
      .executeTakeFirstOrThrow();
    return { ok: true };
  });

export const updateTag = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      type({
        id: "number",
        field: "string",
        value: "string",
      })
    )
  )
  .middleware([authMiddleware])
  .handler(async ({ data }) => {
    if (!["name", "color"].includes(data.field)) {
      throw new Error("Invalid Field");
    }

    await db
      .updateTable("Tag")
      .set({ [data.field]: data.value === "" ? null : data.value })
      .where("id", "=", data.id)
      .execute();

    return { ok: true };
  });
