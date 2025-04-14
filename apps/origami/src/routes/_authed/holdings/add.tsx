import {
  Box,
  Button,
  Checkbox,
  Fieldset,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import CusipInput from "~/components/CusipInput";
import CustomItemSelect from "~/components/CustomItemSelect";
import SymbolSelect from "~/components/SymbolSelect";
import TagSelect from "~/components/TagSelect";
import { createHolding } from "~/lib/functions/holding";
import { getTags } from "~/lib/functions/tag";
import { createHoldingSchema } from "~/lib/schemas/holding";
import { type AssetClass, HoldingType } from "~/lib/server/db/enums";
import { currentInputDate } from "~/lib/utils";
import { useForm } from "~/lib/utils/form";
import { assetTypes } from "~/lib/utils/labels";

export const Route = createFileRoute("/_authed/holdings/add")({
  loader: async () => getTags(),
  component: AddHoldings,
});

function AddHoldings() {
  const tags = Route.useLoaderData();
  const [validCusip, setValidCusip] = useState<boolean>();

  const createHoldingServerFn = useServerFn(createHolding);
  const form = useForm({
    mode: "controlled",
    initialValues: {
      withTransaction: true,
      transaction: {
        date: currentInputDate(),
      },
      tags: [],
    },
    schema: createHoldingSchema,
    mutationFn: (values) => {
      if (values.data.type === HoldingType.BOND && !validCusip)
        return form.setFieldError("symbol", "Cusip is Invalid");
      return createHoldingServerFn(values);
    },
  });

  form.watch("type", () => form.setFieldValue("symbol", ""));
  form.watch("type", () =>
    form.setFieldValue("transaction.type", form.getValues().type as AssetClass)
  );

  const data: { label: string; value: HoldingType; description: string }[] = [
    {
      label: "Stock",
      value: HoldingType.STOCK,
      description: "Common Stock/Preferred Stock/ETF/CEF/etc.",
    },
    {
      label: "Mutual Fund",
      value: HoldingType.MUTUAL_FUND,
      description: "Open Ended Funds",
    },
    {
      label: "Bond",
      value: HoldingType.BOND,
      description: "Bond by CUSIP or FIGI (?)",
    },
  ];

  const SelectItem = ({
    label,
    description,
  }: {
    label: string;
    description: string;
  }) => (
    <Group wrap="nowrap">
      <div>
        <Text fz="sm">{label}</Text>
        <Text fz="xs" c="dimmed">
          {description}
        </Text>
      </div>
    </Group>
  );

  return (
    <Box p="lg" maw={900}>
      <form
        id="form"
        onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}
      >
        <Text size="lg" fw={700}>
          Add a New Holding
        </Text>
        <CustomItemSelect
          data={data}
          itemComponent={SelectItem}
          required
          {...form.getInputProps("type")}
        />
        {form.values.type === HoldingType.BOND && (
          <CusipInput
            form={form}
            setValid={setValidCusip}
            inputProps={form.getInputProps("symbol")}
          />
        )}
        {form.values.type === HoldingType.STOCK && (
          <SymbolSelect
            label="Symbol"
            required
            {...form.getInputProps("symbol")}
          />
        )}
        {form.values.type === HoldingType.MUTUAL_FUND && (
          <SymbolSelect
            label="Symbol"
            required
            api="mutualFunds"
            {...form.getInputProps("symbol")}
          />
        )}
        <Checkbox
          mt="xs"
          label="Include Transaction"
          {...form.getInputProps("withTransaction", { type: "checkbox" })}
        />
        {form.values.withTransaction && (
          <Fieldset mt="xs" legend="Transaction">
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              <NumberInput
                label="Quantity"
                placeholder="Quantity"
                required
                {...form.getInputProps("transaction.quantity")}
              />
              <NumberInput
                label="Price"
                placeholder="Price"
                leftSection="$"
                decimalScale={2}
                required
                {...form.getInputProps("transaction.price")}
              />
              <TextInput
                label="Date"
                placeholder="Date"
                type="date"
                required
                {...form.getInputProps("transaction.date")}
              />
            </SimpleGrid>
          </Fieldset>
        )}
        <SimpleGrid mt="sm" cols={{ base: 1, sm: 3 }}>
          <Select
            label="Asset Category"
            placeholder="Unassigned"
            data={assetTypes}
            searchable
            nothingFoundMessage="No options"
            {...form.getInputProps("category")}
          />
          <TagSelect label="Tags" tags={tags} {...form.getInputProps("tags")} />
        </SimpleGrid>
        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={form.mutation.isPending}>
            Submit
          </Button>
        </Group>
      </form>
    </Box>
  );
}
