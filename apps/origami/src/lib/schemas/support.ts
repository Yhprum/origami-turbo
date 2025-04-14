import { z } from "zod";

export const contactUsSchema = z.object({
  topic: z.enum(["Question", "Report a Problem", "Suggestion", "Other"]),
  subject: z.string().max(100),
  message: z.string().max(5000),
});
