import assert from "node:assert/strict";
import test from "node:test";

import { loadRegistryPageNames, runPageSmoke } from "./registry-pages-smoke.mjs";

test("页面 smoke 必须覆盖 registry 中的全部 20 个页面", async () => {
  const names = loadRegistryPageNames();
  assert.equal(names.length, 20);

  const result = await runPageSmoke({
    installPage: async (name) => name,
  });

  assert.deepEqual(result.checked.sort(), names.sort());
});
