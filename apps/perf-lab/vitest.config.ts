import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["app/**/*.browser.test.ts"],
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
});
