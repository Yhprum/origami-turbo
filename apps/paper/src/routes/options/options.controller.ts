import { notFound } from "@/lib/utils";
import Elysia from "elysia";
import {
  optionsContractParams,
  optionsDetailsParams,
  optionsParams,
} from "./options.schema";
import { find, findContracts, findExpirations } from "./options.service";
import { formattedOption } from "./options.utils";

const optionsController = new Elysia()
  .get(
    "/option/:symbol",
    async ({ params }) => {
      const contract = await find(params.symbol);
      if (!contract) return notFound();

      return formattedOption(contract);
    },
    { params: optionsContractParams }
  )
  .get(
    "/option/:symbol/expirations",
    async ({ params }) => {
      const expirations = await findExpirations(params.symbol);
      if (!expirations) return notFound();

      return expirations;
    },
    { params: optionsParams }
  )
  .get(
    "/option/:symbol/expirations/:expiration/strikes",
    async ({ params }) => {
      const contracts = await findContracts(params.symbol, params.expiration);
      if (!contracts) return notFound();

      return contracts.options
        .filter((contract) => contract.type === "call")
        .map((contract) => contract.strike);
    },
    { params: optionsDetailsParams }
  )
  .get(
    "/option/:symbol/expirations/:expiration/chain",
    async ({ params }) => {
      const contracts = await findContracts(params.symbol, params.expiration);
      if (!contracts) return notFound();

      return {
        ...contracts,
        options: contracts.options.map(formattedOption),
      };
    },
    { params: optionsDetailsParams }
  );

export default optionsController;
