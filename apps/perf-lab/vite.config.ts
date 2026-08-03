import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { defineConfig, type PluginOption } from "vite";

const require = createRequire(import.meta.url);
const reactDomProfiling = require.resolve("react-dom/profiling");

export default defineConfig(({ mode }) => ({
  // pnpm can materialize Vite once with tsx's optional peer and once without it.
  // Both are Vite 7.3.6; erase only that package-instance identity at the seam.
  plugins: [react(), tailwindcss()] as unknown as PluginOption[],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      {
        find: /^@hulianui\/ui-internal\/(.+)$/,
        replacement: fileURLToPath(new URL("../../packages/ui/src/$1", import.meta.url)),
      },
      { find: /^react-dom\/client$/, replacement: reactDomProfiling },
    ],
  },
  server: { port: 5513, strictPort: true },
  build: {
    minify: false,
    sourcemap: true,
  },
  define: {
    __HULIAN_SCAN_STAGE__: JSON.stringify(mode === "measurement" ? "measurement" : "diagnosis"),
  },
}));
