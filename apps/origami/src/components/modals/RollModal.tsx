import {
  Button,
  type ComboboxItem,
  Fieldset,
  Group,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { rollCoveredCall } from "~/lib/functions/option";
import { getExpiries, getOptionChain } from "~/lib/functions/symbol";
import { rollCoveredCallSchema } from "~/lib/schemas/option";
import { closest, currentInputDate } from "~/lib/utils";
import { setModifiedResponse } from "~/lib/utils/dataEditor";
import { useForm } from "~/lib/utils/form";
import { longDate } from "~/lib/utils/formatter";

export default function RollModal({ option, show, closeModal, setData }) {
  const [expiries, setExpiries] = useState<number[]>([]);
  const [strikes, setStrikes] = useState<number[]>([]);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      open: {
        date: currentInputDate(),
      },
      close: {
        date: currentInputDate(),
      },
    },
    schema: rollCoveredCallSchema,
    mutationFn: rollCoveredCall,
    onSuccess: (data) => {
      setModifiedResponse(data, option.id, setData);
      closeModal();
    },
  });

  useEffect(() => {
    if (!option?.symbol) return;
    form.setFieldValue("holding.id", option.id);
    form.setFieldValue("holding.symbol", option.symbol);
    form.setFieldValue("close.strike", option.strike);
    form.setFieldValue("close.expiry", new Date(option.expireDate).getTime());
    form.setFieldValue("close.quantity", option.latestCall.quantity * -1);
    form.setFieldValue("open.quantity", option.latestCall.quantity);
    getExpiries({ data: option.symbol }).then((data) => setExpiries(data));
  }, [option]);

  form.watch("open.expiry", ({ value }) => {
    if (!value) return;

    const values = form.getValues();
    getOptionChain({ data: { symbol: option.symbol, date: value } }).then(
      (data) => {
        if (
          values.open.strike &&
          data &&
          !data.options.some(
            (option) => option.strike === Number(values.open.strike)
          )
        ) {
          const newStrike = data.options
            .map((option) => option.strike)
            .reduce(closest(Number(values.open.strike)));
          form.setFieldValue("open.strike", newStrike);
        }
        setStrikes(data ? data.options.map((option) => option.strike) : []);
      }
    );
  });

  const onClose = () => {
    closeModal();
    form.reset();
  };

  return (
    <Modal
      title={`Rolling Option ${option?.contractSymbol}`}
      size="lg"
      opened={show}
      onClose={onClose}
    >
      <form onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}>
        <Fieldset legend="Old Option">
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <NumberInput
              label="Quantity Closed"
              placeholder="Quantity Bought Back"
              required
              key={form.key("close.quantity")}
              {...form.getInputProps("close.quantity")}
            />
            <NumberInput
              label="Close Price"
              placeholder="Close Price"
              leftSection="$"
              decimalScale={2}
              required
              key={form.key("close.price")}
              {...form.getInputProps("close.price")}
            />
            <TextInput
              label="Date of Close"
              placeholder="Date of CLose"
              type="date"
              required
              key={form.key("close.date")}
              {...form.getInputProps("close.date")}
            />
          </SimpleGrid>
        </Fieldset>
        <Fieldset legend="New Option" mt="md">
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <Select
              label="Expiry Date"
              placeholder="Expiry Date"
              data={expiries.map((expiry) => ({
                label: longDate(expiry),
                value: String(expiry),
              }))}
              required
              key={form.key("open.expiry")}
              {...form.getInputProps("open.expiry")}
            />
            <Select
              label="Strike Price"
              placeholder="Strike Price"
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
              key={form.key("open.strike")}
              {...form.getInputProps("open.strike")}
            />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 3 }} mt="xs">
            <NumberInput
              label="Quantity Opened"
              placeholder="Quantity Opened"
              required
              key={form.key("open.quantity")}
              {...form.getInputProps("open.quantity")}
            />
            <NumberInput
              label="Open Price"
              placeholder="Open Price"
              leftSection="$"
              decimalScale={2}
              required
              key={form.key("open.price")}
              {...form.getInputProps("open.price")}
            />
            <TextInput
              label="Open Date"
              placeholder="Open Date"
              type="date"
              required
              {...form.getInputProps("open.date")}
            />
          </SimpleGrid>
        </Fieldset>
        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={form.mutation.isPending}>
            Let's Roll
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
