import type { ExpressionBuilder } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import type { DB } from "./schema";

export function withTags(eb: ExpressionBuilder<DB, "Holding">) {
  return jsonArrayFrom(
    eb
      .selectFrom("Tag")
      .innerJoin("HoldingTag", "HoldingTag.holdingId", "Holding.id")
      .select(["Tag.id", "Tag.name", "Tag.color"])
      .whereRef("Tag.id", "=", "HoldingTag.tagId")
  ).as("tags");
}
