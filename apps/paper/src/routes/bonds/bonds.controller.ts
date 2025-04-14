import { notFound } from "@/lib/utils";
import Elysia from "elysia";
import { bondsParams, bondsQuery } from "./bonds.schema";
import * as BondsService from "./bonds.service";
import { formattedBond } from "./bonds.utils";

const bondsController = new Elysia()
  .get(
    "/bonds/:cusip",
    async ({ params }) => {
      const { cusip } = params;

      const bond = await BondsService.find(cusip);
      if (!bond) return notFound();

      return formattedBond(bond);
    },
    { params: bondsParams }
  )
  .get(
    "/bonds",
    async ({ query }) => {
      const cusips = query.cusips?.split(",");
      if (!cusips || cusips.length === 0) return [];

      const bonds = await BondsService.findMany(cusips);
      return bonds.map(formattedBond);
    },
    { query: bondsQuery }
  );

export default bondsController;
