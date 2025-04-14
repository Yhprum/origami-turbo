import {
  Combobox,
  Group,
  InputBase,
  Loader,
  type MantineSize,
  Text,
  useCombobox,
} from "@mantine/core";
import { useDebouncedValue, useUncontrolled } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { searchMutualFund, searchStock } from "~/lib/functions/symbol";

interface Props {
  name?: string;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  size?: (string & {}) | MantineSize;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  clearOnSelect?: boolean;
  api?: string;
  debounce?: number;
}

export default function SymbolSelect({
  name,
  label,
  value,
  onChange,
  size,
  placeholder,
  defaultValue,
  required,
  disabled,
  clearOnSelect,
  api = "stocks",
  debounce = 200,
}: Props) {
  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue,
    finalValue: "",
    onChange,
  });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(false);
  const [debounced] = useDebouncedValue(search, debounce);

  const searchQuery = useQuery({
    queryKey: ["search", api, debounced.trim().toUpperCase()],
    queryFn: () =>
      api === "stocks"
        ? searchStock({ data: debounced.trim() })
        : searchMutualFund({ data: debounced.trim() }),
    enabled: Boolean(debounced.trim()) && !selected,
    staleTime: 300000,
  });

  const SelectItem = ({ symbol, name }) => (
    <Group wrap="nowrap">
      <div>
        <Text fz="sm">{symbol}</Text>
        <Text fz="xs" c="dimmed">
          {name}
        </Text>
      </div>
    </Group>
  );

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => setSelected(false),
  });

  const options = (searchQuery.data ?? []).map((item) => (
    <Combobox.Option value={item.symbol} key={item.symbol}>
      <SelectItem {...item} />
    </Combobox.Option>
  ));

  return (
    <Fragment>
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(val) => {
          setSelected(true);
          setValue(val);
          setSearch(clearOnSelect ? "" : val);
          combobox.closeDropdown();
        }}
        size={size}
      >
        <Combobox.Target>
          <InputBase
            rightSection={
              searchQuery.isLoading ? (
                <Loader size={18} />
              ) : (
                <Combobox.Chevron />
              )
            }
            value={search}
            onChange={(event) => {
              combobox.openDropdown();
              combobox.updateSelectedOptionIndex();
              setSelected(false);
              setSearch(event.currentTarget.value);
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => {
              combobox.closeDropdown();
              setSearch(clearOnSelect ? "" : _value || "");
            }}
            label={label}
            placeholder={placeholder ?? "Ticker or Company Name"}
            rightSectionPointerEvents="none"
            size={size}
            name={name}
            required={required}
            disabled={disabled}
          />
        </Combobox.Target>

        {search.length ? (
          <Combobox.Dropdown>
            <Combobox.Options>
              {searchQuery.isLoading ? (
                <Combobox.Empty>Loading...</Combobox.Empty>
              ) : options.length > 0 ? (
                options
              ) : (
                <Combobox.Empty>Nothing found</Combobox.Empty>
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        ) : null}
      </Combobox>
    </Fragment>
  );
}
