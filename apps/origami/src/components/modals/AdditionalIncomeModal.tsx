import {
  Button,
  Group,
  Modal,
  NumberInput,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { createIncome } from "~/lib/functions/income";
import { createIncomeSchema } from "~/lib/schemas/income";
import { currentInputDate, deepCopy } from "~/lib/utils";
import { useForm } from "~/lib/utils/form";

export default function AdditionalIncomeModal({
  show,
  setModal,
  setData,
  holding,
}: {
  show: boolean;
  setModal: (modal: string) => void;
  setData: (data: any) => void;
  holding: any;
}) {
  const createIncomeServerFn = useServerFn(createIncome);
  const form = useForm({
    initialValues: {
      holding,
      date: currentInputDate(),
    },
    schema: createIncomeSchema,
    mutationFn: createIncomeServerFn,
    onSuccess: (id, { data }) => {
      if (!id) return;
      closeModal();
      setData((oldData: any) => {
        const newData = deepCopy(oldData);
        const holdingIndex = newData.findIndex(
          (item: any) => item.id === holding
        );
        newData[holdingIndex].additionalIncome = [
          ...newData[holdingIndex].additionalIncome,
          { id, amount: data.amount, date: data.date, note: data.note },
        ];
        newData[holdingIndex].additionalIncomeTotal += Number(data.amount);
        return newData;
      });
    },
  });

  function closeModal() {
    setModal("");
    form.reset();
  }

  useEffect(() => {
    if (holding && show) {
      form.setFieldValue("holding", holding);
    }
  }, [holding, show]);

  return (
    <Modal
      title="Add Additional Income"
      size="lg"
      opened={show}
      onClose={closeModal}
    >
      <form onSubmit={form.onSubmit((data) => form.mutation.mutate({ data }))}>
        <NumberInput
          label="Amount"
          placeholder="Amount"
          leftSection="$"
          decimalScale={2}
          required
          {...form.getInputProps("amount")}
        />
        <TextInput
          label="Date"
          placeholder="Date"
          type="date"
          required
          {...form.getInputProps("date")}
        />
        <Textarea label="Description/Note" {...form.getInputProps("note")} />
        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={form.mutation.isPending}>
            Submit
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
