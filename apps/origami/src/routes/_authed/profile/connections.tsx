import { Button, Group, Table, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconDownload, IconRefresh, IconTrash } from "@tabler/icons-react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import type { Selectable } from "kysely";
import { useCallback, useEffect, useState } from "react";
import { type PlaidLinkOnSuccess, usePlaidLink } from "react-plaid-link";
import AddConnectionModal from "~/components/modals/AddConnectionModal";
import ImportModal from "~/components/modals/ImportModal";

import {
  createLinkToken,
  deleteConnection,
  exchangePublicToken,
  fetchConnections,
  syncConnection,
} from "~/lib/functions/connection";
import { ConnectionType } from "~/lib/server/db/enums";
import { deleteItem, setModifiedField } from "~/lib/utils/dataEditor";

export const Route = createFileRoute("/_authed/profile/connections")({
  loader: async () => fetchConnections(),
  component: Connections,
});

export interface Connection {
  id: number;
  name: string;
  type: ConnectionType;
  syncedAt: Date | null;
}

function Connections() {
  const { connections } = Route.useLoaderData();
  const router = useRouter();
  const [accounts, setAccounts] = useState(connections);
  const [token, setToken] = useState<string | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [modal, setModal] = useState("");
  const [account, setAccount] = useState<Selectable<Connection>>();

  const onSuccess: PlaidLinkOnSuccess = useCallback(async (publicToken) => {
    await exchangePublicToken({ data: { publicToken } });
    router.invalidate();
  }, []);

  const { open, ready } = usePlaidLink({ token, onSuccess });
  useEffect(() => {
    if (ready) {
      open();
      setConnectLoading(false);
    }
  }, [ready]);

  function linkAccount() {
    setModal("");
    setConnectLoading(true);
    if (ready) {
      open();
      setConnectLoading(false);
    } else {
      createLinkToken().then((data) => setToken(data.link_token));
    }
  }

  const onDeleteAccount = (account: Selectable<Connection>) => {
    modals.openConfirmModal({
      title: "Confirm Deletion",
      children: (
        <Text size="sm">
          Delete Account "{account.name}" and all its transactions?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () =>
        deleteConnection({ data: { id: account.id } }).then((res) => {
          if (res.ok) {
            deleteItem(account.id, setAccounts);
            notifications.show({
              title: "Account Deleted",
              message: `Account "${account.name}" has been successfully deleted`,
            });
          } else {
            notifications.show({
              color: "red",
              title: "There was a problem deleting your account",
              message: "Please try again later",
            });
          }
        }),
    });
  };

  async function importHoldings(account: Selectable<Connection>) {
    setImportLoading(true);
    const response = await syncConnection({ data: { id: account.id } });
    setImportLoading(false);
    setModifiedField("syncedAt", new Date(), account.id, setAccounts);
    if (response.ok) {
      notifications.show({
        title: "Import Complete",
        message: `${response.count} transactions have been imported`,
      });
    } else {
      notifications.show({
        color: "red",
        title: "There was a problem syncing your account",
        message: "Please try again later",
      });
    }
  }

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Account name</Table.Th>
          <Table.Th>Account Type</Table.Th>
          <Table.Th>Last Refreshed</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {accounts.map((account) => (
          <Table.Tr key={account.id}>
            <Table.Td>{account.name}</Table.Td>
            <Table.Td>{account.type}</Table.Td>
            <Table.Td>
              {account.syncedAt
                ? new Date(account.syncedAt).toLocaleString()
                : "-"}
            </Table.Td>
            <Table.Td>
              <Group justify="left" gap="xs">
                {account.type !== ConnectionType.PLAID ? (
                  <Button
                    size="xs"
                    leftSection={<IconDownload size={18} />}
                    onClick={() => {
                      setModal("import");
                      setAccount(account);
                    }}
                    loading={importLoading}
                  >
                    Import
                  </Button>
                ) : account.syncedAt ? (
                  <Button
                    size="xs"
                    disabled
                    leftSection={<IconRefresh size={18} />}
                    loading={importLoading}
                  >
                    Sync
                  </Button>
                ) : (
                  <Button
                    size="xs"
                    leftSection={<IconDownload size={18} />}
                    onClick={() => importHoldings(account)}
                    loading={importLoading}
                  >
                    Import
                  </Button>
                )}
                <Button
                  size="xs"
                  leftSection={<IconTrash size={18} />}
                  color="red"
                  onClick={() => onDeleteAccount(account)}
                >
                  Delete
                </Button>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
        {accounts.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={4}>
              <Text fs="italic" c="dimmed" ta="center">
                No connected accounts
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : null}
        <Table.Tr>
          <Table.Td colSpan={4}>
            <Button
              variant="light"
              fullWidth
              onClick={() => setModal("connect")}
              loading={connectLoading}
            >
              + New Account
            </Button>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
      <ImportModal
        show={modal === "import"}
        closeModal={() => setModal("")}
        setAccounts={setAccounts}
        account={account}
      />
      <AddConnectionModal
        show={modal === "connect"}
        closeModal={() => setModal("")}
        linkAccount={linkAccount}
        setAccounts={setAccounts}
      />
    </Table>
  );
}
