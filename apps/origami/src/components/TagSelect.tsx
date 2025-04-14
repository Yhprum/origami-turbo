import {
  CheckIcon,
  ColorSwatch,
  Combobox,
  Group,
  Pill,
  PillsInput,
  useCombobox,
} from "@mantine/core";
import { useUncontrolled } from "@mantine/hooks";
import { useState } from "react";
import { createTag } from "~/lib/functions/tag";

interface TagSelectProps {
  tags: { id: number; name: string; color: string }[];
  onChange?: any;
  value?: any;
  defaultValue?: string[];
  error?: any;
  onFocus?: any;
  onBlur?: any;
  onTagSelect?: (value: string) => void;
  onTagRemove?: (value: string) => void;
  onTagCreate?: (value: string) => void;
  label?: string;
  name?: string;
}
export default function TagSelect({
  tags,
  onChange,
  value,
  defaultValue,
  error,
  onFocus,
  onBlur,
  onTagSelect,
  onTagRemove,
  onTagCreate,
  label,
  name,
}: TagSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [tagData, setTagData] = useState(tags);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [_value, setValue] = useUncontrolled({
    value,
    defaultValue: defaultValue ?? [],
    finalValue: "",
    onChange,
  });

  const handleValueSelect = async (tagId: string) => {
    if (tagId === "$create") {
      onTagCreate?.(search.trim());
      setLoading(true);
      const tag = await createTag({ data: { name: search.trim() } });
      onTagSelect?.(tag.id.toString());
      setTagData((current) => [...current, tag]);
      setValue((current) => [...current, tag.id.toString()]);
      setLoading(false);
    } else if (_value.includes(tagId)) {
      onTagRemove?.(tagId);
      setValue((current) => current.filter((v) => v !== tagId));
    } else {
      onTagSelect?.(tagId);
      setValue((current) => [...current, tagId]);
    }
    setSearch("");
  };

  const handleValueRemove = (tagId: string) => {
    onTagRemove?.(tagId);
    setValue((current) => current.filter((v) => v !== tagId));
  };

  const values = _value.map((item) => {
    const tag = tagData.find((tag) => tag.id.toString() === item);
    if (!tag) return;
    return (
      <TagPill
        key={tag.id}
        value={tag.name}
        color={tag.color}
        onRemove={() => handleValueRemove(item)}
      />
    );
  });

  const options = tagData
    .filter((tag) =>
      tag.name.toLowerCase().includes(search.trim().toLowerCase())
    )
    .map((tag) => {
      return (
        <Combobox.Option
          key={tag.id}
          value={tag.id.toString()}
          active={_value.includes(tag.id.toString())}
        >
          <Group gap="sm">
            {_value.includes(tag.id.toString()) ? (
              <CheckIcon size={12} />
            ) : null}
            <Group gap={7}>
              <ColorSwatch color={tag.color} size={18} />
              <span>{tag.name}</span>
            </Group>
          </Group>
        </Combobox.Option>
      );
    });

  return (
    <>
      <Combobox
        store={combobox}
        onOptionSubmit={handleValueSelect}
        withinPortal={false}
      >
        <Combobox.DropdownTarget>
          <PillsInput
            onClick={() => combobox.openDropdown()}
            label={label}
            error={error}
          >
            <Pill.Group>
              {values}
              <Combobox.EventsTarget>
                <PillsInput.Field
                  value={search}
                  placeholder={
                    values.length === 0 ? "Search/Create Tags" : undefined
                  }
                  onChange={(event) => {
                    combobox.updateSelectedOptionIndex();
                    setSearch(event.currentTarget.value);
                  }}
                  onFocus={(event) => {
                    onFocus?.(event);
                    combobox.openDropdown();
                  }}
                  onBlur={(event) => {
                    onBlur?.(event);
                    combobox.closeDropdown();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && search.length === 0) {
                      event.preventDefault();
                      handleValueRemove(_value[_value.length - 1]);
                    }
                  }}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>

        <Combobox.Dropdown>
          <Combobox.Options>
            {options}
            {options.length === 0 && search.trim().length === 0 && (
              <Combobox.Option disabled value="">
                Start typing to create your first Tag
              </Combobox.Option>
            )}
            {search.trim().length > 0 && (
              <Combobox.Option disabled={loading} value="$create">
                + {loading ? "Creating" : "Create"} `{search.trim()}`
              </Combobox.Option>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <Combobox.HiddenInput
        name={name}
        // form={form}
        value={_value}
        // disabled={disabled}
      />
    </>
  );
}

interface CountryPillProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string;
  color: string;
  onRemove?: () => void;
}

function TagPill({ value, color, onRemove, ...others }: CountryPillProps) {
  return (
    <Pill
      {...others}
      withRemoveButton
      onRemove={onRemove}
      bg={color}
      c="white"
      fw="bold"
    >
      <Group wrap="nowrap" gap={8}>
        {/* <ColorSwatch color={color} size={12} /> */}
        {value.toUpperCase()}
      </Group>
    </Pill>
  );
}
