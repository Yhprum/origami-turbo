import { z } from "zod";
import { zfd } from "zod-form-data";
import { ConnectionType } from "~/lib/server/db/enums";

export const importFilesSchema = zfd.formData({
  id: zfd.numeric(),
  files: zfd
    .repeatableOfType(zfd.file())
    .refine(
      (fileList) => fileList.every((file) => file.size <= 5e7),
      "Max file size is 50MB."
    ),
});

export const createConnectionSchema = zfd.formData({
  accountName: zfd.text().optional(),
  accountType: z.nativeEnum(ConnectionType), // zfd.text().refine((type) => type in AccountType),
  files: zfd
    .repeatableOfType(zfd.file())
    .refine(
      (fileList) => fileList.every((file) => file.size <= 5e7),
      "Max file size is 50MB."
    ),
});
