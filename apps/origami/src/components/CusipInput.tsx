import { TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { useRef } from "react";
import { validateBond } from "~/lib/functions/symbol";

interface Props {
  setValid: (valid: boolean) => void;
  inputProps: any;
  form: UseFormReturnType<any, any>;
}
export default function CusipInput({ setValid, inputProps, form }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function validate() {
    if (inputRef.current?.value.trim()) {
      const data = await validateBond({
        data: inputRef.current.value,
      });
      if (!data.valid) {
        form.setFieldValue("name", "Invalid Cusip");
        setValid(false);
      } else {
        form.setFieldValue("name", data.bond);
        setValid(true);
      }
    }
  }

  return (
    <TextInput
      label="Cusip"
      placeholder="cusip"
      description={form.values.name}
      ref={inputRef}
      {...inputProps}
      onBlur={validate}
    />
  );
}
