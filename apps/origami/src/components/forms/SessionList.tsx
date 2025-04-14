import {
  Badge,
  Box,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Title,
} from "@mantine/core";
import { UAParser } from "ua-parser-js";
import type { authClient } from "~/lib/authClient";
import RevokeAllSessionsButton from "./RevokeAllSesionsButton";
import RevokeSessionButton from "./RevokeSessionButton";

type Session = typeof authClient.$Infer.Session;

export default function SessionList({
  sessions,
  currentSession,
}: {
  sessions: Session["session"][];
  currentSession: Session["session"] | undefined;
}) {
  return (
    <Box px="lg">
      <Title order={4}>Your Active Sessions</Title>
      <Table>
        <TableThead>
          <TableTr>
            <TableTh>Expiration Date</TableTh>
            <TableTh>Device</TableTh>
            <TableTh>IP Address</TableTh>
            <TableTh>Revoke Session</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {sessions.map((session) => {
            const userAgent = UAParser(session.userAgent ?? undefined);
            return (
              <TableTr key={session.id}>
                <TableTd>
                  {session.expiresAt.toLocaleString()}{" "}
                  {currentSession?.id === session.id && (
                    <Badge size="sm">Current</Badge>
                  )}
                </TableTd>
                <TableTd>{`${userAgent.browser.name} / ${userAgent.os.name}`}</TableTd>
                <TableTd>{session.ipAddress}</TableTd>
                <TableTd>
                  <RevokeSessionButton token={session.token} />
                </TableTd>
              </TableTr>
            );
          })}
          <TableTr>
            <TableTd>
              <RevokeAllSessionsButton />
            </TableTd>
          </TableTr>
        </TableTbody>
      </Table>
    </Box>
  );
}
