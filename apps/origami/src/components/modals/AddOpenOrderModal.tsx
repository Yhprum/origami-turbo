import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import SymbolSelect from "~/components/SymbolSelect";
import { getHolding } from "~/lib/functions/holding";
import { createOpenOrder, updateOpenOrder } from "~/lib/functions/order";
import { createOpenOrderSchema } from "~/lib/schemas/order";
import { currentInputDate, deepCopy } from "~/lib/utils";
import { setModifiedResponse } from "~/lib/utils/dataEditor";
import { useForm } from "~/lib/utils/form";

export default function AddOpenOrderModal({
  show,
  setModal,
  setData,
  holdingId,
  row,
}) {
  const navigate = useNavigate({ from: "/orders" });
  const form = useForm({
    initialValues: {
      gtc: currentInputDate(1000 * 60 * 60 * 24 * 60),
    },
    schema: createOpenOrderSchema,
    mutationFn: (values) =>
      row
        ? updateOpenOrder({ data: { ...values.data, id: row.id } })
        : createOpenOrder(values),
    onSuccess: (data) => {
      if (row) {
        setModifiedResponse(data, row.id, setData);
      } else {
        setData((oldData) => [data, ...deepCopy(oldData)]);
        navigate({ search: undefined });
      }
      setModal("");
      form.reset();
    },
  });

  function closeModal() {
    navigate({ search: undefined });
    setModal("");
    form.reset();
  }

  useEffect(() => {
    if (holdingId) {
      setModal("add");
      getHolding({ data: holdingId }).then((data) =>
        form.setFieldValue("symbol", data.symbol)
      );
      form.setFieldValue("holding", Number.parseInt(holdingId));
    }
  }, [holdingId]);

  useEffect(() => {
    if (row) {
      form.setValues({
        symbol: row.symbol,
        quantity: row.quantity,
        price: row.orderPrice,
        gtc: currentInputDate(1000 * 60 * 60 * 24 * 60),
        buy: row.buySell === "B" ? "Buy" : "Sell",
        orderType: row.limitStop,
        holding: row.holding,
      });
    }
  }, [row]);

  return (
    <Modal
      title={`${row ? "Edit" : "New"} Open Order`}
      size="lg"
      opened={show}
      onClose={closeModal}
    >
      <form onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}>
        {holdingId || row ? (
          <TextInput
            label="Symbol"
            {...form.getInputProps("symbol")}
            disabled
          />
        ) : (
          <SymbolSelect
            label="Symbol"
            required
            {...form.getInputProps("symbol")}
          />
        )}
        <SimpleGrid cols={{ base: 1, sm: 3 }} mt="xs">
          <NumberInput
            label="Quantity"
            placeholder="Quantity"
            required
            {...form.getInputProps("quantity")}
          />
          <NumberInput
            label="Order Price"
            placeholder="Price"
            leftSection="$"
            decimalScale={2}
            required
            {...form.getInputProps("price")}
          />
          <TextInput
            label="GTC Date"
            placeholder="Date"
            type="date"
            required
            {...form.getInputProps("gtc")}
          />
        </SimpleGrid>
        <SimpleGrid cols={{ base: 1, sm: 3 }} mt="xs">
          <Select
            label="Order Type"
            placeholder="Select One"
            data={[
              { value: "S/L", label: "Stop Limit" },
              { value: "L", label: "Limit" },
            ]}
            required
            {...form.getInputProps("orderType")}
          />
          <Select
            label="Buy/Sell?"
            placeholder="Select One"
            data={["Buy", "Sell"]}
            required
            {...form.getInputProps("buy")}
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
