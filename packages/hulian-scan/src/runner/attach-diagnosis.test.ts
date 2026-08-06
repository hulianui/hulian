import { describe, expect, it } from "vitest";

import type { Finding, ScenarioRun } from "../contracts";
import { attachDiagnosis } from "./default-dependencies";

// 这条守的是一次真实的静默失效：`attachDiagnosis` 曾把确认后的 finding 的 severity
// 硬编码成 "error"，于是 budgets.ts 把 avoidable-render 降级成 warning 之后，
// 这条路径照旧让 CI 变红 —— 单测全绿、真跑仍拦。severity 必须沿用规则自己给的。
function run(scenarioId: string): ScenarioRun {
  const changed = {
    isFirstMount: false,
    parent: true,
    props: [],
    state: false,
    context: false,
    hooks: [],
  };
  return {
    schemaVersion: 1,
    scenarioId,
    stage: "diagnosis",
    environment: "workspace",
    samples: Array.from({ length: 5 }, () => ({ commitDurationMs: 1 })),
    events: [
      { type: "commit", commitId: 1, timestampMs: 0, durationMs: 1, stepId: "mount" },
      {
        type: "fiber-render",
        commitId: 2,
        fiberId: 1,
        name: "Kbd",
        ownerName: "GenericFixture",
        depth: 3,
        actualDurationMs: 0.1,
        selfDurationMs: 0.1,
        stepId: "stable-parent-update",
        changeDescription: changed,
      },
    ],
    errors: [],
    metadata: { category: "standard", component: "Kbd" },
  } as unknown as ScenarioRun;
}

const CONFIG = {
  defaults: { maxAvoidableRenderCount: 0, minSamples: 5 },
  categories: {},
  scenarios: {},
} as unknown as Parameters<typeof attachDiagnosis>[2];

const candidate: Finding = {
  id: "kbd/basic:avoidable-render-candidate:Kbd",
  scenarioId: "kbd/basic",
  component: "Kbd",
  rule: "avoidable-render-candidate",
  severity: "warning",
  current: 2,
  evidence: ["2 parent-update renders"],
};

describe("attachDiagnosis", () => {
  it("确认后沿用规则自身的 severity，不再写死 error", () => {
    const attached = attachDiagnosis([candidate], [run("kbd/basic")], CONFIG);
    expect(attached).toHaveLength(1);
    expect(attached[0]).toMatchObject({ rule: "avoidable-render", severity: "warning" });
  });

  it("诊断没确认时把候选丢掉", () => {
    expect(attachDiagnosis([candidate], [], CONFIG)).toEqual([]);
  });
});
