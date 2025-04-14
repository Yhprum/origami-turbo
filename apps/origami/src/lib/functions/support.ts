import { createServerFn } from "@tanstack/react-start";
import contactUsTemplate from "~/lib/email-templates/contact-us";
import env from "~/lib/env";
import { contactUsSchema } from "~/lib/schemas/support";
import { SUPPORT_EMAIL, sendEmail } from "~/lib/server/email";
import { serverFunctionStandardValidator } from "~/lib/utils/form";
import { authMiddleware } from "./middleware";

export const contactUs = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(contactUsSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const email = await sendEmail({
      from: SUPPORT_EMAIL,
      to: env.SUPPORT_EMAIL,
      subject: `[${data.topic.toUpperCase()}] ${data.subject}`,
      react: contactUsTemplate(context.user.email, data.message),
    });

    if (email.error) throw new Error("email error");
  });
