import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "~/lib/auth";
import { authMiddleware } from "~/lib/functions/middleware";
import {
  changeEmailSchema,
  changeNameSchema,
  changePasswordSchema,
  updateUserSchema,
} from "~/lib/schemas/user";
import { db } from "~/lib/server/db";
import logger from "~/lib/server/logger";
import {
  ValidationError,
  serverFunctionStandardValidator,
} from "~/lib/utils/form";

export const updateUser = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(updateUserSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    await db
      .updateTable("User")
      .set({ cash: data.cash, yield: data.yield / 100 })
      .where("id", "=", context.user.id)
      .execute();
    logger.info(
      `User ${context.user.id} has updated cash: ${data.cash}, yield: ${data.yield}`
    );
  });

export const changeName = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(changeNameSchema))
  .handler(async ({ data }) => {
    const req = getWebRequest();
    if (!req) throw new Error("Failed to update user");

    const res = await auth.api.updateUser({
      headers: req.headers,
      body: {
        name: data.name,
      },
    });
    if (!res.status) throw new Error("Failed to update user");
  });

export const changeEmail = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(changeEmailSchema))
  .handler(async ({ data }) => {
    const req = getWebRequest();
    if (!req) throw new Error("Failed to update user");

    const res = await auth.api.changeEmail({
      headers: req.headers,
      body: {
        newEmail: data.email,
      },
    });
    if (!res.status) throw new Error("Failed to update email");
  });

export const changePassword = createServerFn({ method: "POST" })
  .validator(serverFunctionStandardValidator(changePasswordSchema))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const req = getWebRequest();
    if (!req) throw new Error("Failed to update password");

    const ctx = await auth.$context;
    const accounts = await ctx.internalAdapter.findAccounts(context.user.id);
    const credentialAccount = accounts.find(
      (account) => account.providerId === "credential"
    );
    const currentPassword = credentialAccount?.password;
    if (!credentialAccount || !currentPassword) {
      throw new Error("Failed to update password");
    }

    const validPassword = await ctx.password.verify({
      hash: currentPassword,
      password: data.oldPassword,
    });

    if (!validPassword) {
      throw new ValidationError([
        {
          message: "Incorrect password",
          path: ["oldPassword"],
        },
      ]);
    }

    const hash = await ctx.password.hash(data.password);
    await ctx.internalAdapter.updatePassword(context.user.id, hash);
  });
