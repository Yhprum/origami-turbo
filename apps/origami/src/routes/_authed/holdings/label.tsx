import {
  ActionIcon,
  Box,
  Checkbox,
  Group,
  Menu,
  NativeSelect,
  Pagination,
  Select,
  Text,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import TagSelect from "~/components/TagSelect";
import {
  tagHolding,
  untagHolding,
  updateHolding,
} from "~/lib/functions/holding";
import { getLabels } from "~/lib/functions/tag";
import useLoaders from "~/lib/hooks/useLoaders";
import { enumToWords } from "~/lib/utils";
import { assetTypes } from "~/lib/utils/labels";

export const Route = createFileRoute("/_authed/holdings/label")({
  loader: async () => getLabels(),
  component: RouteComponent,
});

function RouteComponent() {
  const { holdings, tags } = Route.useLoaderData();

  const { updateLoader, renderLoader } = useLoaders();
  const [pageSize, setPageSize] = useLocalStorage({
    key: "origami.label-page-size",
    defaultValue: 10,
  });
  const [activePage, setPage] = useState(1);
  const [closed, setClosed] = useState(true);
  const [tagged, setTagged] = useState(false);
  const [holdingTypes, setHoldingTypes] = useState([
    ...new Set(holdings.map((a) => a.type.toString())),
  ]);

  function updateCategory(id: number, value: string | string[]) {
    updateLoader(id, "loading");
    updateHolding({ data: { id, field: "category", value } })
      .then(() => updateLoader(id, "done"))
      .catch(() => updateLoader(id, "error"));
  }

  function tag(promise: Promise<boolean>, holdingId: number) {
    updateLoader(holdingId, "loading");
    promise
      .then((ok) => updateLoader(holdingId, ok ? "done" : "error"))
      .catch(() => updateLoader(holdingId, "error"));
  }

  let processedData = holdings;
  if (closed) processedData = processedData.filter((item) => !item.closed);
  if (tagged)
    processedData = processedData.filter(
      (item) => !(item.tags.length || item.category)
    );
  if (holdingTypes)
    processedData = processedData.filter((item) =>
      holdingTypes.includes(item.type)
    );
  processedData = processedData.sort((a, b) => {
    const aName = a.name || a.symbol;
    const bName = b.name || b.symbol;
    return aName > bName ? 1 : bName > aName ? -1 : 0;
  });

  return (
    <Box p={16} maw={900}>
      <Group>
        <Menu
          position="top-end"
          shadow="md"
          width={200}
          closeOnItemClick={false}
        >
          <Menu.Target>
            <ActionIcon variant="subtle" color="grey" ml="auto">
              <IconSettings />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Options</Menu.Label>
            <Menu.Item>
              <Checkbox
                label="Hide Closed Assets"
                checked={closed}
                onChange={(e) => setClosed(e.target.checked)}
              />
            </Menu.Item>
            <Menu.Item>
              <Checkbox
                label="Hide Tagged Assets"
                checked={tagged}
                onChange={(e) => setTagged(e.target.checked)}
              />
            </Menu.Item>
            <Menu.Divider />
            <Menu.Label>Holding Types</Menu.Label>
            <Menu.Item>
              <Checkbox.Group value={holdingTypes} onChange={setHoldingTypes}>
                {[...new Set(holdings.map((a) => a.type))].map((type, i) => (
                  <Checkbox
                    key={type}
                    mt={i !== 0 ? 4 : undefined}
                    value={type}
                    label={enumToWords(type)}
                  />
                ))}
              </Checkbox.Group>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Box component="table" w="100%">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Tags</th>
            <th>Asset Category</th>
          </tr>
        </thead>
        <tbody>
          {processedData
            ?.slice(pageSize * (activePage - 1), pageSize * activePage)
            .map((holding) => (
              <tr key={holding.id}>
                <td>
                  <Text>{holding.name || holding.symbol}</Text>
                </td>
                <td>
                  <TagSelect
                    tags={tags}
                    onTagSelect={(tagId) =>
                      tag(
                        tagHolding({
                          data: { holdingId: holding.id, tagId: Number(tagId) },
                        }),
                        holding.id
                      )
                    }
                    onTagRemove={(tagId) =>
                      tag(
                        untagHolding({
                          data: { holdingId: holding.id, tagId: Number(tagId) },
                        }),
                        holding.id
                      )
                    }
                    defaultValue={holding.tags.map((tag) => tag.id.toString())}
                  />
                </td>
                <td>
                  <Select
                    placeholder="Unassigned"
                    data={assetTypes}
                    defaultValue={holding.category}
                    onChange={(value) =>
                      updateCategory(holding.id, value ?? "")
                    }
                    searchable
                    clearable
                    allowDeselect
                    nothingFoundMessage="No options"
                  />
                </td>
                <td>{renderLoader(holding.id)}</td>
              </tr>
            ))}
        </tbody>
      </Box>
      <Group mt="md" mb="xl" justify="space-between">
        <span />
        {processedData.length > pageSize ? (
          <Pagination
            value={activePage}
            onChange={setPage}
            total={Math.ceil(processedData.length / pageSize)}
          />
        ) : (
          <span />
        )}
        <Group gap="xs">
          <Text>Page Size</Text>
          <NativeSelect
            value={pageSize}
            onChange={(e) => setPageSize(Number.parseInt(e.target.value))}
            data={["10", "20", "25", "50"]}
          />
        </Group>
      </Group>
    </Box>
  );
}
