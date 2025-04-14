import { type } from "arktype";

export const loginSchema = type({
  email: "string.email",
  password: "0 < string < 255",
});

export const registerSchema = type({
  email: "string.email",
  password: "8 <= string < 255",
});
