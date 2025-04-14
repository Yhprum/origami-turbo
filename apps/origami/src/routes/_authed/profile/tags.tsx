import {
  ActionIcon,
  Box,
  Button,
  ColorInput,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconTag, IconTrash } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { createTag, deleteTag, getTags, updateTag } from "~/lib/functions/tag";

export const Route = createFileRoute("/_authed/profile/tags")({
  loader: async () => getTags(),
  component: Tags,
});

function Tags() {
  const userTags = Route.useLoaderData();
  const [tags, handlers] = useListState(userTags);

  const createTagServerFn = useServerFn(createTag);
  const updateTagServerFn = useServerFn(updateTag);
  const deleteTagServerFn = useServerFn(deleteTag);

  const createTagMutation = useMutation({
    mutationFn: createTagServerFn,
    onSuccess: (tag) => handlers.append(tag),
  });

  const updateTagMutation = useMutation({
    mutationFn: updateTagServerFn,
  });

  const deleteTagMutation = useMutation({
    mutationFn: deleteTagServerFn,
    onSuccess: (_tags, variables) =>
      // @ts-expect-error: variables is unknown for some reason
      handlers.filter((t) => t.id !== variables.data.id),
  });

  function removeTag(id: number) {
    modals.openConfirmModal({
      title: "Confirm Deletion",
      children: (
        <Text size="sm">
          Deleting this tag will remove it from all your holdings
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteTagMutation.mutate({ data: { id } });
      },
    });
  }

  return (
    <Box p="md" maw={800}>
      <Table withRowBorders={false}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Color</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tags.map((tag) => (
            <Table.Tr key={tag.id}>
              <Table.Td>
                <TextInput
                  placeholder="Tag Name"
                  defaultValue={tag.name}
                  onBlur={(e) =>
                    updateTagMutation.mutate({
                      data: {
                        id: tag.id,
                        field: "name",
                        value: e.target.value,
                      },
                    })
                  }
                  autoFocus={tag.name === ""}
                />
              </Table.Td>
              <Table.Td>
                <ColorInput
                  defaultValue={tag.color}
                  onBlur={(e) =>
                    updateTagMutation.mutate({
                      data: {
                        id: tag.id,
                        field: "color",
                        value: e.target.value,
                      },
                    })
                  }
                  withEyeDropper={false}
                />
              </Table.Td>
              <Table.Td>
                <ActionIcon
                  size="input-sm"
                  color="red"
                  onClick={() => removeTag(tag.id)}
                >
                  <IconTrash size={20} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td colSpan={2}>
              <Button
                fullWidth
                leftSection={<IconTag size={18} />}
                onClick={() => createTagMutation.mutate({ data: {} })}
                loading={createTagMutation.isPending}
              >
                New Tag
              </Button>
            </Table.Td>
          </Table.Tr>
        </Table.Tfoot>
      </Table>
    </Box>
  );
}
