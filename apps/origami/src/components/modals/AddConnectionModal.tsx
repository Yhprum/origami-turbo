import {
  Button,
  Divider,
  Group,
  Modal,
  Select,
  Text,
  TextInput,
  rem,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconFileTypeCsv, IconUpload, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { type Dispatch, Fragment, type SetStateAction, useState } from "react";
import type { z } from "zod";
import { createConnection } from "~/lib/functions/connection";
import type { createConnectionSchema } from "~/lib/schemas/connection";
import type { ConnectionType } from "~/lib/server/db/enums";

interface Props {
  show: boolean;
  closeModal: () => void;
  linkAccount: () => void;
  setAccounts: Dispatch<
    SetStateAction<
      {
        type: ConnectionType;
        id: number;
        name: string;
        syncedAt: Date | null;
      }[]
    >
  >;
}
export default function AddConnectionModal({
  show,
  closeModal,
  linkAccount,
  setAccounts,
}: Props) {
  const [state, setState] = useState("select");

  const accountTypes = [
    { label: "E*Trade", value: "ETRADE" },
    { label: "Vanguard", value: "VANGUARD" },
  ];

  const createConnectionServerFn = useServerFn(createConnection);
  const form = useForm<z.infer<typeof createConnectionSchema>>({
    initialValues: {
      files: [],
      accountType: undefined as unknown as ConnectionType,
    },
  });

  const createConnectionMutation = useMutation({
    mutationFn: createConnectionServerFn,
    onSuccess: (response) => {
      closeModal();
      form.reset();
      setAccounts((accounts) => [...accounts, response.account]);
      notifications.show({
        title: "Import Complete",
        message: `${response.count} Transaction(s) have been imported`,
      });
    },
    onError: () => {
      notifications.show({
        color: "red",
        title: "There was an error importing your files",
        message: "Please try again later",
      });
    },
  });

  async function upload(values: typeof form.values) {
    if (!values.files.length) return;

    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((file) => data.append(key, file));
      } else if (value) {
        data.append(key, value);
      }
    });

    createConnectionMutation.mutate({ data });
  }

  function onClose() {
    closeModal();
    setState("select");
    form.reset();
  }

  return (
    <Modal title="Add Account" opened={show} onClose={onClose}>
      {state === "select" ? (
        <Fragment>
          <Button fullWidth onClick={linkAccount}>
            Link your Brokerage Account
          </Button>
          <Divider my="xs" label="or" labelPosition="center" />
          <Button
            fullWidth
            variant="outline"
            onClick={() => setState("import")}
          >
            Import transaction files manually
          </Button>
        </Fragment>
      ) : (
        <form onSubmit={form.onSubmit(upload)}>
          <Select
            label="Account Type"
            placeholder="Select One"
            data={accountTypes}
            required
            {...form.getInputProps("accountType")}
          />
          {form.values.accountType ? (
            <Fragment>
              <TextInput
                my="xs"
                label="Account Name"
                placeholder="New Account"
                {...form.getInputProps("accountName")}
              />
              <Text size="sm">Transaction Files</Text>
              <Dropzone
                multiple
                accept={[MIME_TYPES.csv, MIME_TYPES.xls, MIME_TYPES.xlsx]}
                onDrop={(files) =>
                  form.setFieldValue(
                    "files",
                    files.filter((file) => file.name.endsWith(".csv"))
                  )
                }
              >
                <Group
                  justify="center"
                  gap="xl"
                  mih={150}
                  style={{ pointerEvents: "none" }}
                >
                  <Dropzone.Accept>
                    <IconUpload
                      style={{
                        width: rem(52),
                        height: rem(52),
                        color: "var(--mantine-color-blue-6)",
                      }}
                      stroke={1.5}
                    />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX
                      style={{
                        width: rem(52),
                        height: rem(52),
                        color: "var(--mantine-color-red-6)",
                      }}
                      stroke={1.5}
                    />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconFileTypeCsv
                      style={{
                        width: rem(52),
                        height: rem(52),
                        color: "var(--mantine-color-dimmed)",
                      }}
                      stroke={1.5}
                    />
                  </Dropzone.Idle>

                  {form.values.files.length ? (
                    <div>
                      {form.values.files.map((file, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: static file list
                        <Text key={i} mt={7} inline>
                          {file.name}
                        </Text>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <Text size="xl" inline>
                        Drag files here or click to select files
                      </Text>
                      <Text size="sm" c="dimmed" inline mt={7}>
                        Attach multiple files at once if your brokerage limits
                        export ranges
                      </Text>
                    </div>
                  )}
                </Group>
              </Dropzone>
              <Button
                mt="md"
                type="submit"
                fullWidth
                loading={createConnectionMutation.isPending}
                disabled={!form.values.files.length}
              >
                Import
              </Button>
            </Fragment>
          ) : (
            <Text mt="sm" size="sm" fs="italic">
              If your brokerage is not listed, send us a request with your
              brokerage name and a sample csv file that you would use to import.
            </Text>
          )}
        </form>
      )}
    </Modal>
  );
}
