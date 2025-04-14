import { type } from "arktype";

export const updateUserSchema = type({ cash: "number", yield: "number" });

export const changePasswordSchema = type({
  oldPassword: "string",
  password: "8 <= string < 255",
  confirm: "string",
}).narrow((data, ctx) => {
  if (data.password !== data.confirm) {
    return ctx.reject({
      expected: "identical to password",
      actual: "",
      path: ["confirm"],
    });
  }
  if (data.oldPassword === data.password) {
    return ctx.reject({
      expected: "different from old password",
      actual: "",
      path: ["password"],
    });
  }
  return true;
});

export const resetPasswordSchema = type({
  password: "8 <= string < 255",
  confirm: "string",
  token: "string",
}).narrow((data, ctx) => {
  if (data.password !== data.confirm) {
    return ctx.reject({
      expected: "identical to password",
      actual: "",
      path: ["confirm"],
    });
  }
  return true;
});

export const changeNameSchema = type({ name: "string < 100" });

export const changeEmailSchema = type({ email: "string.email" });
