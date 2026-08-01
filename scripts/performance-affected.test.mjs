import assert from "node:assert/strict";
import test from "node:test";

import { affectedScenarioIds } from "./performance-affected.mjs";

const inventory = [
  { id: "button", kind: "renderable", scenarioId: "button/basic" },
  { id: "table", kind: "renderable", scenarioId: "table/stress" },
  { id: "badge", kind: "renderable", scenarioId: "badge/basic" },
  { id: "access", kind: "non-rendering" },
];

test("always selects core/heavy and adds the changed component scenario", () => {
  assert.deepEqual(affectedScenarioIds(inventory, ["packages/ui/src/badge/badge.tsx"]), [
    "badge/basic",
    "button/basic",
    "table/stress",
  ]);
});

test("shared scanner changes retain the generated core/heavy set", () => {
  assert.deepEqual(affectedScenarioIds(inventory, ["packages/hulian-scan/src/cli.ts"]), [
    "button/basic",
    "table/stress",
  ]);
});
