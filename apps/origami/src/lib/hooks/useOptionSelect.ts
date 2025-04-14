import { useEffect, useState } from "react";
import { getExpiries, getOptionChain } from "~/lib/functions/symbol";

export default function useOptionSelect(
  symbol: string | null,
  strike: number,
  expiry: number
) {
  const [strikes, setStrikes] = useState<number[]>([]);
  const [expiries, setExpiries] = useState<number[]>([]);

  useEffect(() => {
    if (symbol) getExpiries({ data: symbol }).then((data) => setExpiries(data));
  }, [symbol]);

  useEffect(() => {
    if (symbol && expiry)
      getOptionChain({ data: { symbol, date: expiry } }).then((data) =>
        setStrikes(data?.options.map((option) => option.strike) ?? [])
      );
  }, [expiry]);

  return { strikes, expiries };
}
