import serverTiming from "@elysiajs/server-timing";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import bondsController from "./routes/bonds/bonds.controller";
import optionsController from "./routes/options/options.controller";
import searchController from "./routes/search/search.controller";
import stocksController from "./routes/stocks/stocks.controller";
import tokenController from "./routes/token/token.controller";

const app = new Elysia({
  // serve: {
  //   tls: {
  //     cert: Bun.file("./cert.pem"),
  //     key: Bun.file("./key.pem"),
  //     passphrase: "qwerqwer",
  //   },
  // }
})
  .use(swagger())
  .use(serverTiming())
  .onError(({ code, error }) => {
    if (code === "NOT_FOUND") return;
    console.log(code, error);
  })
  .get("/", () => "Hello Elysia")
  .use(stocksController)
  .use(bondsController)
  .use(optionsController)
  .use(searchController)
  .use(tokenController)
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type PaperAPI = typeof app;
