import {
  Button,
  type ComboboxItem,
  Group,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core";
import { Fragment, useEffect, useState } from "react";
import { createOptionTransaction } from "~/lib/functions/option";
import { getExpiries, getOptionChain } from "~/lib/functions/symbol";
import { addOptionTransactionSchema } from "~/lib/schemas/option";
import { closest, currentInputDate } from "~/lib/utils";
import { setModifiedResponse } from "~/lib/utils/dataEditor";
import { useForm } from "~/lib/utils/form";
import { longDate } from "~/lib/utils/formatter";

export default function AddOptionModal({
  show,
  closeModal,
  holding,
  formData,
  setData,
}) {
  const [expiries, setExpiries] = useState<number[]>([]);
  const [strikes, setStrikes] = useState<number[]>([]);
  const form = useForm({
    initialValues: {
      date: currentInputDate(),
    },
    schema: addOptionTransactionSchema,
    mutationFn: createOptionTransaction,
    onSuccess: (data) => {
      setModifiedResponse(data, holding.id, setData);
      closeModal();
    },
  });

  useEffect(() => {
    if (!formData.symbol || formData.type !== "Open") return;
    getExpiries({ data: formData.symbol }).then((data) => setExpiries(data));
  }, [formData.symbol]);

  useEffect(() => {
    if (!form.values.expiry || formData.type !== "Open") return;
    getOptionChain({
      data: { symbol: formData.symbol, date: form.values.expiry },
    }).then((data) => {
      if (
        form.values.strike &&
        data &&
        !data.options.some(
          (option) => option.strike === Number(form.values.strike)
        )
      ) {
        const newStrike = data.options
          .map((option) => option.strike)
          .reduce(closest(Number(form.values.strike)));
        form.setFieldValue("open.strike", newStrike);
      }
      setStrikes(data ? data.options.map((option) => option.strike) : []);
    });
  }, [form.values.expiry]);

  useEffect(() => {
    if (!formData.fields?.length) return;
    formData.fields.forEach((f) => form.setFieldValue(f.field, f.value));
  }, [formData]);

  const strikeExpiryInputs = () => {
    return formData.type === "Close" ? (
      <Fragment>
        <TextInput
          type="date"
          label="Expiry Date"
          disabled
          value={form.values.expiry}
        />
        <TextInput label="Strike Price" disabled value={form.values.strike} />
      </Fragment>
    ) : (
      <Fragment>
        <Select
          label="Expiry Date"
          placeholder="Expiry Date"
          data={expiries.map((expiry) => ({
            label: longDate(expiry),
            value: String(expiry),
          }))}
          required
          {...form.getInputProps("expiry")}
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
          {...form.getInputProps("strike")}
        />
      </Fragment>
    );
  };

  const onClose = () => {
    closeModal();
    form.reset();
  };

  return (
    <Modal
      title="Add Option Transaction"
      size="lg"
      opened={show}
      onClose={onClose}
    >
      <form onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}>
        <Text mt="xs" size="md" fw={700}>
          Add Option
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          {strikeExpiryInputs()}
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 3 }} mt="xs">
          <NumberInput
            label="Quantity"
            placeholder="Quantity"
            required
            {...form.getInputProps("quantity")}
          />
          <NumberInput
            label="Price"
            placeholder="Price"
            leftSection="$"
            decimalScale={2}
            required
            {...form.getInputProps("price")}
          />
          <TextInput
            label="Date"
            placeholder="Date"
            type="date"
            required
            {...form.getInputProps("date")}
          />
        </SimpleGrid>
        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={form.mutation.isPending}>
            Submit
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
