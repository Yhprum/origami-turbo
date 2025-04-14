import {
  ActionIcon,
  Button,
  ColorInput,
  Modal,
  NativeSelect,
  NumberInput,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { IconTrash } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import {
  type Dispatch,
  Fragment,
  type SetStateAction,
  useEffect,
  useState,
} from "react";
import { setColumnStyle } from "~/lib/functions/preferences";
import type { TableName } from "~/lib/server/db/enums";
import type { Column, InitialCellStyleProps } from "~/lib/table/types";

interface FormStyles {
  column: string;
  type: string;
  to: string;
  breakpoint?: number;
  styleType: string;
  styleColor: any[];
  id: string;
}

interface Props<T> {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  table: TableName;
  columnDefs: Column<T>[];
  columnStyles?: InitialCellStyleProps[];
}
export default function CustomizeTableModal<T>({
  show,
  setShow,
  table,
  columnDefs,
  columnStyles,
}: Props<T>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      styles: [] as FormStyles[],
    },
  });

  const typeOptions = [
    { value: "", label: "Always" },
    { value: "gt", label: "If Value is Greater Than" },
    { value: "gte", label: "If Value is Greater Than or Equal To" },
    { value: "lt", label: "If Value is Less Than" },
    { value: "lte", label: "If Value is Less Than or Equal To" },
    { value: "eq", label: "If Value is Equal To" },
  ];

  const columnOptions = columnDefs.map((column) => ({
    value: column.accessorKey,
    label: column.header,
  }));

  useEffect(() => {
    if (!show || form.values.styles.length || !columnStyles?.length) return;

    form.setInitialValues({
      styles: columnStyles.map((style) => {
        const styleIsArray = Array.isArray(style.style);
        if ("type" in style) {
          return {
            column: style.column,
            type: style.type ?? "",
            to: typeof style.to === "string" ? style.to : "",
            breakpoint: typeof style.to === "number" ? style.to : undefined,
            styleType: Object.keys(
              styleIsArray ? style.style[0] : style.style
            )[0],
            styleColor: style.style.flatMap((style) => Object.values(style)),
            id: randomId(),
          };
        }
        return {
          column: style.column,
          type: "",
          to: "",
          breakpoint: undefined,
          styleType: Object.keys(
            styleIsArray ? style.style[0] : style.style
          )[0],
          styleColor: Object.values(style.style),
          id: randomId(),
        };
      }),
    });
    form.reset();
  }, [show, columnStyles]);

  function addStyle() {
    form.insertListItem("styles", {
      column: "",
      type: "",
      styleType: "backgroundColor",
      styleColor: ["#228be41a", ""],
      id: randomId(),
    });
  }

  async function save() {
    setLoading(true);
    const styles: InitialCellStyleProps[] = form.values.styles
      .map((style) => {
        if (!style.column) return null;
        if (style.type === "")
          return {
            column: style.column,
            style: { [style.styleType]: style.styleColor[0] },
          };
        return {
          column: style.column,
          style: [
            { [style.styleType]: style.styleColor[0] },
            { [style.styleType]: style.styleColor[1] },
          ],
          type: style.type,
          to: style.to === "" ? style.breakpoint : style.to,
        };
      })
      .filter((s): s is InitialCellStyleProps => s !== null);
    await setColumnStyle({ data: { table, styles } });
    router.invalidate();
    // TODO: add styles to table state and don't reload after saving
    // setLoading(false);
    // setShow(false);
  }

  return (
    <Modal
      title="Column Styles"
      fullScreen
      opened={show}
      onClose={() => setShow(false)}
      zIndex={400}
    >
      <table>
        <thead>
          <tr>
            <th>Column to Style</th>
            <th>When to Style</th>
            <th colSpan={2}>Compare to</th>
            <th>What to Style</th>
            <th>Color</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {form.values.styles.map((style, index) => (
            <tr key={style.id}>
              <td>
                <Select
                  searchable
                  placeholder="Column"
                  comboboxProps={{ zIndex: 450 }}
                  data={columnOptions}
                  {...form.getInputProps(`styles.${index}.column`)}
                />
              </td>
              <td>
                <NativeSelect
                  data={typeOptions}
                  {...form.getInputProps(`styles.${index}.type`)}
                />
              </td>
              {form.values.styles[index].type !== "" ? (
                <Fragment>
                  <td>
                    <Select
                      searchable
                      defaultValue=""
                      comboboxProps={{ zIndex: 450 }}
                      data={[
                        {
                          group: "",
                          items: [{ value: "", label: "A Fixed Value..." }],
                        },
                        { group: "Columns", items: [...columnOptions] },
                      ]}
                      {...form.getInputProps(`styles.${index}.to`)}
                    />
                  </td>
                  {form.values.styles[index].to === "" ? (
                    <td>
                      <NumberInput
                        placeholder="Value"
                        {...form.getInputProps(`styles.${index}.breakpoint`)}
                      />
                    </td>
                  ) : (
                    <td />
                  )}
                </Fragment>
              ) : (
                <Fragment>
                  <td />
                  <td />
                </Fragment>
              )}
              <td>
                <NativeSelect
                  data={[
                    { value: "color", label: "Text Color" },
                    { value: "backgroundColor", label: "Background Color" },
                  ]}
                  {...form.getInputProps(`styles.${index}.styleType`)}
                />
              </td>
              <td>
                <ColorInput
                  format="hexa"
                  withEyeDropper={false}
                  popoverProps={{ zIndex: 450 }}
                  {...form.getInputProps(`styles.${index}.styleColor.0`)}
                />
              </td>
              {form.values.styles[index].type === "" ? (
                <td />
              ) : (
                <td>
                  <ColorInput
                    format="hexa"
                    withEyeDropper={false}
                    placeholder="Color if comparison fails"
                    popoverProps={{ zIndex: 450 }}
                    {...form.getInputProps(`styles.${index}.styleColor.1`)}
                  />
                </td>
              )}
              <td>
                <ActionIcon
                  color="red"
                  onClick={() => form.removeListItem("styles", index)}
                >
                  <IconTrash size="1rem" />
                </ActionIcon>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="subtle" fullWidth onClick={addStyle}>
        + New Column Style
      </Button>
      <Button fullWidth onClick={save} loading={loading}>
        Save Styles
      </Button>
    </Modal>
  );
}
