import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { updateOptionIdeaSchema } from "~/lib/schemas/optionIdea";
import { db } from "~/lib/server/db";
import { IdeaType } from "~/lib/server/db/enums";
import { getSummary } from "~/lib/server/external/symbolAPI";
import { formatOptionIdeas } from "~/lib/server/formatters/optionIdeasFormatter";
import {
  contractToDetails,
  getContractSymbol,
} from "~/lib/server/formatters/utils";
import logger from "~/lib/server/logger";
import paper from "~/lib/server/paper";
import { closest } from "~/lib/utils";
import { serverFunctionStandardValidator } from "~/lib/utils/form";
import { authMiddleware } from "./middleware";

export const getOptionIdeas = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const ideas = await db
      .selectFrom("Idea")
      .selectAll()
      .where("userId", "=", context.user.id)
      .where("type", "=", IdeaType.OPTION)
      .selectAll()
      .execute();

    const formattedIdeas = await formatOptionIdeas(ideas);
    return formattedIdeas.sort((a, b) => a.symbol.localeCompare(b.symbol));
  });

export const createOptionIdea = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      z.object({
        symbol: z.string(),
        preferences: z.object({
          strikeRound: z.number().default(0.8),
          plusMonths: z.number().default(3),
        }),
      })
    )
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    let contractSymbol: string;
    const stock = await getSummary(data.symbol);
    const expiries = (
      await paper.option({ symbol: data.symbol }).expirations.get()
    ).data;
    if (expiries?.length && stock) {
      const targetPrice = stock.price * data.preferences.strikeRound;
      const targetDate =
        Date.now() + 1000 * 60 * 60 * 24 * 30 * data.preferences.plusMonths;
      const expiry = expiries.reduce(closest(targetDate));
      const chain = (
        await paper
          .option({ symbol: data.symbol })
          .expirations({ expiration: expiry })
          .chain.get()
      ).data;
      if (!chain) throw new Error("No Options Found");
      const strike = chain.options
        .filter((item) => item.type === "call")
        .map((item) => item.strike)
        .reduce(closest(targetPrice));
      contractSymbol = getContractSymbol(data.symbol, strike, expiry, "call");
    } else {
      throw new Error("No Options Found");
    }

    const idea = await db
      .insertInto("Idea")
      .values({
        symbol: contractSymbol,
        type: IdeaType.OPTION,
        userId: context.user.id,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    const formattedIdea = await formatOptionIdeas([idea]);
    logger.info(
      `User ${context.user.id} has added an option idea for ${contractSymbol}`
    );
    return formattedIdea[0];
  });

export const updateOptionIdea = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(updateOptionIdeaSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const symbol =
      "contractSymbol" in data
        ? data.contractSymbol
        : getContractSymbol(
            data.symbol,
            Number(data.strike),
            Number(data.expiry),
            "call"
          );
    const idea = await db
      .updateTable("Idea")
      .set({ symbol })
      .where("id", "=", data.id)
      .where("userId", "=", context.user.id)
      .returningAll()
      .executeTakeFirstOrThrow();
    const ideaDetails = await formatOptionIdeas([idea]);
    return ideaDetails[0];
  });

export const updateAllOptionIdeas = createServerFn({ method: "POST" })
  .validator(
    serverFunctionStandardValidator(
      z.object({
        strikeRound: z.number().default(0.8),
        plusMonths: z.number().default(3),
      })
    )
  )
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const ideas = await db
      .selectFrom("Idea")
      .selectAll()
      .where("userId", "=", context.user.id)
      .where("type", "=", IdeaType.OPTION)
      .execute();
    const params = await Promise.all(
      ideas.map(async (idea) => {
        const { symbol } = contractToDetails(idea.symbol);
        const stock = await getSummary(symbol);
        const expiries = (await paper.option({ symbol }).expirations.get())
          .data;
        if (!expiries || !stock) throw new Error("No Options Found");
        const targetPrice = stock.price * data.strikeRound;
        const targetDate =
          Date.now() + 1000 * 60 * 60 * 24 * 30 * data.plusMonths;
        const expiry = expiries.reduce(closest(targetDate));

        const chain = (
          await paper
            .option({ symbol })
            .expirations({ expiration: expiry })
            .chain.get()
        ).data;
        if (!chain) throw new Error("No Options Found");
        const strike = chain.options
          .filter((item) => item.type === "call")
          .map((item) => item.strike)
          .reduce(closest(targetPrice));
        const contractSymbol = getContractSymbol(
          symbol,
          strike,
          expiry,
          "call"
        );
        return { id: idea.id, symbol: contractSymbol };
      })
    );

    const newIdeas = (
      await db.transaction().execute(async (trx) => {
        return Promise.all(
          params.map(async (param) =>
            trx
              .updateTable("Idea")
              .set({ symbol: param.symbol })
              .where("id", "=", param.id)
              .returningAll()
              .execute()
          )
        );
      })
    ).flat();

    const formattedIdeas = await formatOptionIdeas(newIdeas);
    return formattedIdeas.sort((a, b) => a.symbol.localeCompare(b.symbol));
  });
