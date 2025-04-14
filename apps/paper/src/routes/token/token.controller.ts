import { getAuthToken } from "@/routes/token/token.service";
import { Elysia } from "elysia";

const tokenController = new Elysia()
  .get("/token", async ({ query }) => {
    const { code } = query;
    console.log(code);
    await getAuthToken(code);
    return {
      message: "Token received",
    };
  })
  .get("/token-url", async () => {
    return {
      url: `https://api.schwabapi.com/v1/oauth/authorize?response_type=code&client_id=${Bun.env.SCHWAB_CLIENT_ID}&scope=readonly&redirect_uri=${Bun.env.SCHWAB_REDIRECT_URI}`,
    };
  });

export default tokenController;
