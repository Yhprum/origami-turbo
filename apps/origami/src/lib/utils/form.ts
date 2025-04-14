import {
  type FormErrors,
  type UseFormInput,
  useForm as useMantineForm,
} from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { useMutation } from "@tanstack/react-query";
import type { _TransformValues } from "node_modules/@mantine/form/lib/types";

type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

export function useForm<
  TData,
  Values extends Record<string, unknown> = Record<string, unknown>,
  TransformValues extends _TransformValues<Values> = (values: Values) => Values,
>(
  props?: Omit<
    UseFormInput<Values, TransformValues>,
    "initialValues" | "validate"
  > & {
    initialValues?: DeepPartial<Values>;
    schema: StandardSchemaV1<Values, unknown>;
    mutationFn?: (variables: { data: Values }) => Promise<TData>;
    onSuccess?: Parameters<
      typeof useMutation<TData, Error, { data: Values }>
    >[0]["onSuccess"];
    onError?: Parameters<
      typeof useMutation<TData, Error, { data: Values }>
    >[0]["onError"];
  }
) {
  const form = useMantineForm({
    mode: "uncontrolled",
    ...props,
    validate: props?.schema
      ? mantineFormStandardResolver(props.schema)
      : undefined,
    initialValues: props?.initialValues as Values,
  });

  const mutation = useMutation({
    mutationFn: props?.mutationFn,
    onSuccess: props?.onSuccess,
    onError: (error, variables, context) => {
      if (isValidationError(error)) {
        form.setErrors(formatErrors(error.issues));
      } else if (props?.onError) {
        props.onError(error, variables, context);
      } else {
        notifications.show({
          color: "red",
          title: "An error occurred",
          message: "Please try again later",
        });
      }
    },
  });

  return { ...form, mutation };
}

export class ValidationError extends Error {
  issues: StandardSchemaV1.Issue[] = [];

  constructor(issues: readonly StandardSchemaV1.Issue[]) {
    super();
    Object.setPrototypeOf(this, ValidationError.prototype);
    this.issues = issues.map((issue) => ({
      message: issue.message,
      path: issue.path,
    }));
    this.name = "ValidationError";
  }
}

export function isValidationError(err: unknown): err is ValidationError {
  return Boolean(
    err &&
      (err instanceof ValidationError ||
        (err as ValidationError).name === "ValidationError")
  );
}

function mantineFormStandardResolver<T extends StandardSchemaV1>(schema: T) {
  return (values: Record<string, unknown>) => {
    const parsed = schema["~standard"].validate(values);

    if (parsed instanceof Promise) {
      throw new TypeError("Schema validation must be synchronous");
    }

    if (parsed.issues) {
      return formatErrors(parsed.issues);
    }

    return {};
  };
}

export function serverFunctionStandardValidator<T extends StandardSchemaV1>(
  schema: T
): (values: unknown) => StandardSchemaV1.InferOutput<T> {
  return (values: unknown) => {
    const parsed = schema["~standard"].validate(values);
    if (parsed instanceof Promise) {
      throw new TypeError("Schema validation must be synchronous");
    }
    if (parsed.issues) {
      throw new ValidationError(parsed.issues);
    }

    return parsed.value;
  };
}

function formatErrors(issues: readonly StandardSchemaV1.Issue[]) {
  const formattedErrors: FormErrors = {};
  for (const issue of issues) {
    if (issue.path) {
      formattedErrors[issue.path.map(extractPath).join(".")] = issue.message;
    }
  }
  return formattedErrors;
}

function extractPath(
  path: StandardSchemaV1.PathSegment | PropertyKey
): PropertyKey {
  if (typeof path === "object") {
    return path.key;
  }

  return path;
}
