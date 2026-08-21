import assert from "node:assert/strict";
import test from "node:test";

import { affectedScenarioIds } from "./performance-affected.mjs";

const inventory = [
  { id: "button", kind: "renderable", scenarioId: "button/basic" },
  { id: "table", kind: "renderable", scenarioId: "table/stress" },
  { id: "badge", kind: "renderable", scenarioId: "badge/basic" },
  { id: "access", kind: "non-rendering" },
];

const coreHeavy = ["button/basic", "table/stress"];

test("always selects core/heavy and adds the changed component scenario", () => {
  assert.deepEqual(affectedScenarioIds(inventory, ["packages/ui/src/badge/badge.tsx"]), [
    "badge/basic",
    ...coreHeavy,
  ]);
});

test("showcase and style changes count as runtime changes", () => {
  for (const path of [
    "packages/ui/src/badge/badge.showcase.tsx",
    "packages/ui/src/badge/badge.types.ts",
    "packages/ui/src/badge/badge.css",
  ]) {
    assert.deepEqual(
      affectedScenarioIds(inventory, [path]),
      ["badge/basic", ...coreHeavy],
      `${path} should widen the scan`,
    );
  }
});

// 门禁的成本全在这里：0.55.0 那个 PR 改了 758 个组件 md，383 个 slug 被判波及（真正碰到
// 代码的只有 12 个），Runtime Performance 从常态 2m30s 涨到 1h26m。文档与测试都进不了
// 运行时，不该扩大扫描面。
test("documentation-only changes do not widen the scan", () => {
  for (const path of [
    "packages/ui/src/badge/badge.md",
    "packages/ui/src/badge/badge.en.md",
    "packages/ui/src/badge/README.md",
  ]) {
    assert.deepEqual(
      affectedScenarioIds(inventory, [path]),
      coreHeavy,
      `${path} should not widen the scan`,
    );
  }
});

test("test-only changes do not widen the scan", () => {
  for (const path of [
    "packages/ui/src/badge/badge.test.tsx",
    "packages/ui/src/badge/badge.browser.test.tsx",
    "packages/ui/src/badge/badge.stories.tsx",
  ]) {
    assert.deepEqual(
      affectedScenarioIds(inventory, [path]),
      coreHeavy,
      `${path} should not widen the scan`,
    );
  }
});

test("a component with both doc and code changes is still selected", () => {
  assert.deepEqual(
    affectedScenarioIds(inventory, [
      "packages/ui/src/badge/badge.md",
      "packages/ui/src/badge/badge.tsx",
    ]),
    ["badge/basic", ...coreHeavy],
  );
});

// 共享改动（scanner / tokens / lockfile / ui 的 lib·config·motion）刻意**不**扩散到全库：
// PR 这一支的设计前提就是「只扫改动波及的场景，不拖慢 PR」，全库覆盖由 schedule 支的
// Weekly structural sweep 负责（见 ci.yml 里 runtime-performance 的注释）。写死的
// core/heavy 就是共享改动的兜底。
test("shared changes fall back to core/heavy without widening to every component", () => {
  for (const path of [
    "packages/hulian-scan/src/cli.ts",
    "packages/tokens/src/index.ts",
    "packages/ui/src/lib/cn.ts",
    "pnpm-lock.yaml",
  ]) {
    assert.deepEqual(affectedScenarioIds(inventory, [path]), coreHeavy, `${path} falls back`);
  }
});

test("non-rendering entries never enter the scenario list", () => {
  assert.deepEqual(affectedScenarioIds(inventory, ["packages/ui/src/access/access.tsx"]), coreHeavy);
});
