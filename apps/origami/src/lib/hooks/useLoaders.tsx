import { Loader } from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { IconCheck, IconX } from "@tabler/icons-react";

export default function useLoaders() {
  const [loader, setLoader] = useSetState<
    Record<number, "loading" | "done" | "error">
  >({});

  function updateLoader(id: number, value: "loading" | "done" | "error") {
    setLoader({ [id]: value });
  }

  function renderLoader(id: number) {
    switch (loader[id]) {
      case "loading":
        return <Loader size="sm" />;
      case "done":
        return <IconCheck style={{ color: "green" }} />;
      case "error":
        return <IconX style={{ color: "red" }} />;
      default:
        break;
    }
  }

  return { updateLoader, renderLoader };
}
