import { type CreateEmailOptions, Resend } from "resend";
import env from "~/lib/env";

const resend = new Resend(env.RESEND_API_KEY);

export const NOREPLY_EMAIL = "Origami <noreply@tradeorigami.com>";
export const SUPPORT_EMAIL = "Origami Support <support@tradeorigami.com>";

export async function sendEmail(values: CreateEmailOptions) {
  return await resend.emails.send(values);
}
