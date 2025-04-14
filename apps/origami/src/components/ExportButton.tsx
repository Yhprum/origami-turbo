import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { exportCSV } from "~/lib/utils";

interface Props {
  title: string;
  headers: string[];
  data: any[];
}

export default function ExportButton({ title, headers, data }: Props) {
  return (
    <Button
      variant="subtle"
      size="compact-sm"
      onClick={() => exportCSV(headers, data, `${title}.csv`)}
      leftSection={<IconDownload size={20} />}
    >
      Export
    </Button>
  );
}
