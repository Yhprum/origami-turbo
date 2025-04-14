import { type } from "arktype";

export const createIncomeSchema = type({
  holding: "number",
  amount: "number",
  date: "string.date",
  note: "string",
});
