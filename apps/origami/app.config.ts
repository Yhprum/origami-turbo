import { defineConfig } from "@tanstack/react-start/config";
import { patchCssModules } from "vite-css-modules";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import oxlintPlugin from "vite-plugin-oxlint";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  tsr: {
    appDirectory: "src",
  },
  vite: {
    plugins: [
      oxlintPlugin({ path: "src" }),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
      // TODO: temporary fix for css modules: https://github.com/TanStack/router/issues/3023
      patchCssModules(),
      cssInjectedByJsPlugin(),
    ],
    resolve: {
      alias: {
        // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
        "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
      },
    },
  },
  server: {
    preset: "bun",
  },
});
