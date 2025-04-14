import { Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import { Fragment, type ReactNode } from "react";

interface Props {
  label?: string;
  placeholder?: string;
  data: any[];
  itemComponent: (props: any) => ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}
export default function CustomItemSelect({
  label,
  placeholder,
  data,
  itemComponent,
  value,
  defaultValue,
  onChange,
  name,
  required,
  disabled,
}: Props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue,
    finalValue: "",
    onChange,
  });
  const selectedOption = data.find((item) => item.value === _value);

  const options = data.map((item) => (
    <Combobox.Option value={item.value} key={item.value}>
      {itemComponent(item)}
    </Combobox.Option>
  ));

  return (
    <Fragment>
      <Combobox
        store={combobox}
        withinPortal={false}
        onOptionSubmit={(val) => {
          setValue(val);
          combobox.closeDropdown();
        }}
      >
        <Combobox.Target>
          <InputBase
            type="button"
            component="button"
            label={label ?? "Holding Type"}
            pointer
            rightSection={<Combobox.Chevron />}
            onClick={() => combobox.toggleDropdown()}
            rightSectionPointerEvents="none"
            required={required}
            disabled={disabled}
            multiline
          >
            {selectedOption ? (
              itemComponent(selectedOption)
            ) : (
              <Input.Placeholder>{placeholder ?? "Pick One"}</Input.Placeholder>
            )}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>{options}</Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <input type="hidden" name={name} value={_value} readOnly={disabled} />
    </Fragment>
  );
}
