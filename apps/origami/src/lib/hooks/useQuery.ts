import {
  type DefinedInitialDataOptions,
  useQueryClient,
  useQuery as useTanstackQuery,
} from "@tanstack/react-query";
import type { MutatorCallback } from "~/lib/utils/dataEditor";

export function useQuery<T>(options: DefinedInitialDataOptions<T>) {
  const queryClient = useQueryClient();
  const queryResult = useTanstackQuery(options);

  const setData: MutatorCallback<T> = (callback) => {
    queryClient.setQueryData(options.queryKey, callback);
  };

  return { ...queryResult, setData };
}
