import { Button, Group, Modal, Text, rem } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconFileTypeCsv, IconUpload, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import type { z } from "zod";
import { importFilesToAccount } from "~/lib/functions/connection";
import type { importFilesSchema } from "~/lib/schemas/connection";
import type { ConnectionType } from "~/lib/server/db/enums";
import { setModifiedField } from "~/lib/utils/dataEditor";
import type { Connection } from "~/routes/_authed/profile/connections";

interface ImportModalProps {
  show: boolean;
  closeModal: () => void;
  account:
    | {
        id: number;
        type: ConnectionType;
        name: string;
        syncedAt: Date | null;
      }
    | undefined;
  setAccounts: Dispatch<SetStateAction<Connection[]>>;
}
export default function ImportModal({
  show,
  closeModal,
  account,
  setAccounts,
}: ImportModalProps) {
  const importFilesServerFn = useServerFn(importFilesToAccount);
  const form = useForm<z.infer<typeof importFilesSchema>>({
    mode: "controlled",
    initialValues: {
      id: -1,
      files: [],
    },
  });

  useEffect(() => {
    if (!show || !account) return;
    form.setFieldValue("id", account.id);
  }, [show, account]);

  const importFilesMutation = useMutation({
    mutationFn: importFilesServerFn,
    onSuccess: (count) => {
      if (!account) return;
      setModifiedField("syncedAt", new Date(), account.id, setAccounts);
      notifications.show({
        title: "Import Complete",
        message: `${count} Transaction(s) have been imported`,
      });
      closeModal();
      form.reset();
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
    if (!account || !values.files.length) return;

    const data = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((file) => data.append(key, file));
      } else if (value) {
        data.append(key, value.toString());
      }
    });

    importFilesMutation.mutate({ data });
  }

  function onClose() {
    closeModal();
    form.reset();
  }

  return (
    <Modal title="Import Transactions" opened={show} onClose={onClose}>
      <form onSubmit={form.onSubmit(upload)}>
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
                  Attach multiple files at once if your brokerage limits export
                  ranges
                </Text>
              </div>
            )}
          </Group>
        </Dropzone>
        <Button
          mt="md"
          type="submit"
          fullWidth
          loading={importFilesMutation.isPending}
          disabled={!form.values.files.length}
        >
          Import
        </Button>
      </form>
    </Modal>
  );
}
