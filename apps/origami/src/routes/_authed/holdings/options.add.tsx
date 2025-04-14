import {
  Box,
  Button,
  type ComboboxItem,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import SymbolSelect from "~/components/SymbolSelect";
import TagSelect from "~/components/TagSelect";
import { getHolding } from "~/lib/functions/holding";
import { createCoveredCallHolding } from "~/lib/functions/option";
import { getExpiries, getOptionChain } from "~/lib/functions/symbol";
import { getTags } from "~/lib/functions/tag";
import type { HoldingType } from "~/lib/server/db/enums";
import { currentInputDate } from "~/lib/utils";
import { longDate } from "~/lib/utils/formatter";

const addOptionSearchSchema = z.object({
  holding: z.number().optional(),
  contract: z.string().optional(),
});

export const Route = createFileRoute("/_authed/holdings/options/add")({
  validateSearch: addOptionSearchSchema,
  loader: async () => await getTags(),
  component: AddOptionPage,
});

interface HoldingDetails {
  symbol: string;
  id: number;
  type: HoldingType;
  contractSymbol: string;
}

function AddOptionPage() {
  const tags = Route.useLoaderData();
  const searchParams = Route.useSearch();

  const [holding, setHolding] = useState<HoldingDetails>();
  const [loading, setLoading] = useState(false);

  const [symbol, setSymbol] = useState<string>();
  const [expiries, setExpiries] = useState<number[]>([]);
  const [strikes, setStrikes] = useState<number[]>([]);

  useEffect(() => {
    if (!symbol || holding) return;
    getExpiries({ data: symbol }).then((data) => setExpiries(data));
  }, [symbol]);

  function onSelectExpiry(expiry: string | null) {
    if (!expiry || !symbol) return;
    getOptionChain({ data: { symbol, date: Number(expiry) } }).then((data) =>
      setStrikes(data?.options.map((option) => option.strike) ?? [])
    );
  }

  const contractSymbol = searchParams.contract;
  useEffect(() => {
    if (searchParams.holding && contractSymbol) {
      getHolding({ data: searchParams.holding }).then((response) => {
        setHolding({ ...response, contractSymbol });
      });
    }
  }, [searchParams]);

  const addHolding = (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {} as any;
    new FormData(e.target).forEach((value, key) => {
      const keys = key.split(".");
      if (keys.length === 1) data[key] = value;
      else data[keys[0]] = { ...data[keys[0]], [keys[1]]: value };
    });
    if (holding) data.holding = holding.id;
    createCoveredCallHolding({ data }).finally(() => setLoading(false));
  };

  return (
    <Box p="lg" maw={900}>
      <form onSubmit={addHolding}>
        <Text size="lg" fw={700}>
          Add Holding
        </Text>
        <div>
          {holding ? (
            <TextInput
              readOnly
              label="Symbol"
              name="symbol"
              defaultValue={holding.symbol}
            />
          ) : (
            <SymbolSelect
              label="Symbol"
              name="symbol"
              onChange={setSymbol}
              required
            />
          )}
          <Text mt="xs" size="md" fw={700}>
            Call Leg
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            {holding ? (
              <TextInput
                readOnly
                label="Contract"
                name="contract"
                defaultValue={holding.contractSymbol}
              />
            ) : (
              <>
                <Select
                  label="Expiry Date"
                  name="call.expiry"
                  placeholder={
                    expiries.length
                      ? "Choose an Expiry Date"
                      : "Select a Symbol First"
                  }
                  data={expiries.map((expiry) => ({
                    label: longDate(expiry),
                    value: String(expiry),
                  }))}
                  onChange={onSelectExpiry}
                  disabled={expiries.length === 0}
                  required
                />
                <Select
                  label="Strike Price"
                  placeholder="Choose a Strike Price"
                  name="call.strike"
                  data={strikes.map((strike) => `${strike}`)}
                  disabled={strikes.length === 0}
                  searchable
                  nothingFoundMessage="No options"
                  filter={({ options, search }) =>
                    (options as ComboboxItem[]).filter((option) =>
                      option.label.startsWith(search)
                    )
                  }
                  required
                />
              </>
            )}
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 3 }} mt="xs">
            <NumberInput
              name="call.quantity"
              label="Quantity"
              placeholder="Quantity"
              defaultValue={-1}
              max={-1}
              required
            />
            <NumberInput
              name="call.price"
              label="Price"
              placeholder="Price"
              leftSection="$"
              decimalScale={2}
              required
            />
            <TextInput
              name="call.date"
              label="Date"
              placeholder="Date"
              type="date"
              defaultValue={currentInputDate()}
              required
            />
          </SimpleGrid>
          <Text mt="xs" size="md" fw={700}>
            Stock Leg
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <NumberInput
              name="stock.quantity"
              label="Quantity"
              placeholder="Quantity"
              defaultValue={100}
              min={0}
              step={100}
              required
            />
            <NumberInput
              name="stock.price"
              label="Price"
              placeholder="Price"
              leftSection="$"
              decimalScale={2}
              required
            />
            <TextInput
              name="stock.date"
              label="Date"
              placeholder="Date"
              type="date"
              defaultValue={currentInputDate()}
              required
            />
          </SimpleGrid>
          <Text mt="xs" size="md" fw={700}>
            Additional Data
          </Text>
          <TagSelect name="tags" label="Tags" tags={tags} />
          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={loading}>
              Add Holding
            </Button>
          </Group>
        </div>
      </form>
    </Box>
  );
}
