import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // Dictionary files are imported by demo runtime modules in unit tests. The
      // production Intlayer entry also loads its Node compiler stack (including
      // esbuild), which cannot initialize after jsdom replaces typed-array
      // globals. Tests only need the pure dictionary-node constructor.
      intlayer: fileURLToPath(new URL("./test/intlayer.ts", import.meta.url)),
    },
  },
  // monorepo 内同时存在 vite@6 与 vite@7，@vitejs/plugin-react 的 Plugin 类型与
  // vitest/config 期望的 PluginOption 分属不同 vite 版本 → TS2769。vite 在 www 里仅用于
  // vitest（站点本身是 Next 构建），故此处按 any 收口，不影响构建/测试运行时。
  plugins: [react() as unknown as never],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
