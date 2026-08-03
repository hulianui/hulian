import { describe, expect, it } from "vitest";

import type { FiberRenderEvent, ScenarioRun } from "../contracts";
import { evaluateBudget } from "./budgets";

function makeRun(
  stage: ScenarioRun["stage"],
  fibers: FiberRenderEvent[] = [],
): ScenarioRun {
  return {
    schemaVersion: 1,
    scenarioId: "button/basic",
    stage,
    environment: "workspace",
    samples: Array.from({ length: 5 }, () => ({ commitDurationMs: 3 })),
    events: [
      { type: "commit", commitId: 1, timestampMs: 1, durationMs: 3 },
      ...fibers,
    ],
    errors: [],
    metadata: {},
  };
}

function parentRender(
  selfDurationMs: number,
  changeDescription?: unknown,
): FiberRenderEvent {
  return {
    type: "fiber-render",
    commitId: 1,
    fiberId: 4,
    name: "Button",
    ownerName: "Fixture",
    depth: 1,
    actualDurationMs: selfDurationMs,
    selfDurationMs,
    stepId: "stable-parent-update",
    changeDescription,
  };
}

describe("evaluateBudget", () => {
  it("emits a diagnosis candidate for repeated parent-update renders", () => {
    const findings = evaluateBudget({
      run: makeRun("measurement", [parentRender(0.1), parentRender(0.1)]),
      component: "Button",
      budget: {
        minAvoidableRenderMs: 0.5,
        minRepeatedAvoidableRenders: 2,
      },
      minSamples: 5,
    });

    expect(findings).toEqual([
      expect.objectContaining({
        rule: "avoidable-render-candidate",
        severity: "warning",
        current: 2,
      }),
    ]);
  });

  it("promotes only unchanged diagnosis renders and ignores first mounts", () => {
    const unchanged = {
      isFirstMount: false,
      props: [],
      state: false,
      context: false,
      hooks: [],
      parent: true,
    };
    const firstMount = { ...unchanged, isFirstMount: true };
    const findings = evaluateBudget({
      run: makeRun("diagnosis", [
        parentRender(0.7, unchanged),
        parentRender(0.8, firstMount),
      ]),
      component: "Button",
      budget: { maxAvoidableRenderCount: 0 },
      minSamples: 5,
    });

    expect(findings).toEqual([
      expect.objectContaining({
        rule: "avoidable-render",
        severity: "error",
        current: 1,
      }),
    ]);
  });

  it("promotes reference changes that are safely equal by value", () => {
    const findings = evaluateBudget({
      run: makeRun("diagnosis", [
        parentRender(0.7, {
          isFirstMount: false,
          props: [
            {
              name: "items",
              previous: { id: 1, nested: ["stable"] },
              next: { id: 1, nested: ["stable"] },
            },
          ],
          state: false,
          context: false,
          hooks: [],
          parent: true,
        }),
      ]),
      component: "Button",
      budget: { maxAvoidableRenderCount: 0 },
      minSamples: 5,
    });

    expect(findings).toEqual([
      expect.objectContaining({ rule: "avoidable-render", current: 1 }),
    ]);
  });

  it("reports infrastructure failures before performance conclusions", () => {
    const run = makeRun("measurement");
    run.samples = [{ commitDurationMs: Number.NaN }];
    run.events = [];
    run.errors = ["scenario timeout"];

    expect(
      evaluateBudget({
        run,
        component: "Button",
        budget: {},
        minSamples: 5,
      }).map((finding) => finding.rule),
    ).toEqual([
      "scenario-error",
      "missing-commit",
      "insufficient-samples",
      "invalid-sample",
    ]);
  });

  it("does not turn untrusted software-GPU WebGL timings into hard findings", () => {
    const run = makeRun("measurement");
    run.samples = Array.from({ length: 5 }, () => ({
      commitDurationMs: 1,
      longTaskMs: 900,
      droppedFrameRatio: 0.7,
    }));
    run.metadata = {
      webgl: true,
      gpuMode: "software",
      gpuMetricsTrusted: false,
    };

    expect(
      evaluateBudget({
        run,
        component: "Shader",
        budget: { maxLongTaskMs: 100, maxDroppedFrameRatio: 0.05 },
        baseline: { longTaskMs: 20, droppedFrameRatio: 0 },
        minSamples: 5,
      }).map((finding) => finding.rule),
    ).toEqual([]);
  });

  // 基线是机器绑定的绝对耗时，只从 packed-consumer 采集。下面三条锁住它的可比性边界：
  // 跨环境不判、跨机器（CI）不判、同环境同机器照常判 —— 最后一条防止把门禁关死。
  it("同环境同机器：超出基线仍判时间回归", () => {
    const run = makeRun("measurement");
    const findings = evaluateBudget({
      run: { ...run, environment: "packed-consumer" },
      component: "Button",
      budget: { relativeRegressionPct: 20, absoluteRegressionMs: 2 },
      baseline: { commitDurationMs: 1 },
    });
    expect(findings.map((finding) => finding.rule)).toContain("regression:commitDurationMs");
  });

  it("跨环境：workspace 运行不拿 packed-consumer 基线判时间回归", () => {
    const findings = evaluateBudget({
      run: makeRun("measurement"),
      component: "Button",
      budget: { relativeRegressionPct: 20, absoluteRegressionMs: 2 },
      baseline: { commitDurationMs: 1 },
    });
    expect(findings.map((finding) => finding.rule)).not.toContain("regression:commitDurationMs");
  });

  it("跨机器：trustTimingMetrics=false 时不判时间回归（CI runner 与基线机器不可比）", () => {
    const run = makeRun("measurement");
    const findings = evaluateBudget({
      run: { ...run, environment: "packed-consumer" },
      component: "Button",
      budget: {
        relativeRegressionPct: 20,
        absoluteRegressionMs: 2,
        trustTimingMetrics: false,
      },
      baseline: { commitDurationMs: 1 },
    });
    expect(findings.map((finding) => finding.rule)).not.toContain("regression:commitDurationMs");
  });

  it("跨机器：trustTimingMetrics=false 同样放行 long-task 这类机器绑定的绝对阈值", () => {
    const run = makeRun("measurement");
    const timed: typeof run = {
      ...run,
      samples: Array.from({ length: 5 }, () => ({ commitDurationMs: 3, longTaskMs: 400 })),
    };
    expect(
      evaluateBudget({
        run: timed,
        component: "Button",
        budget: { maxLongTaskMs: 100 },
      }).map((finding) => finding.rule),
    ).toContain("long-task");
    expect(
      evaluateBudget({
        run: timed,
        component: "Button",
        budget: { maxLongTaskMs: 100, trustTimingMetrics: false },
      }).map((finding) => finding.rule),
    ).not.toContain("long-task");
  });

  it("跨机器：fanout 也按机器绑定跳过（同代码本地 33 / CI 82，留着只会训练人忽略红灯）", () => {
    const run = makeRun("measurement");
    const wide: typeof run = {
      ...run,
      samples: Array.from({ length: 5 }, () => ({ commitDurationMs: 3, cascadeFanout: 400 })),
    };
    expect(
      evaluateBudget({
        run: wide,
        component: "Button",
        budget: { maxCascadeFanout: 30, trustTimingMetrics: false },
      }).map((finding) => finding.rule),
    ).not.toContain("cascade-fanout");
    // 同机器（默认可信）时照常门禁 —— 不是把这条规则删了。
    expect(
      evaluateBudget({ run: wide, component: "Button", budget: { maxCascadeFanout: 30 } }).map(
        (finding) => finding.rule,
      ),
    ).toContain("cascade-fanout");
  });


  it("结构性计数按中位数判定：单次尾部抖动不误报", () => {
    const run = makeRun("measurement");
    const jittery: typeof run = {
      ...run,
      // 一次调度抖动把某个 commit 顶到 58，中位数仍是 30 —— 不该报。
      samples: [30, 28, 58, 26, 31].map((cascadeFanout) => ({
        commitDurationMs: 3,
        cascadeFanout,
      })),
    };
    expect(
      evaluateBudget({ run: jittery, component: "Form", budget: { maxCascadeFanout: 50 } }).map(
        (finding) => finding.rule,
      ),
    ).not.toContain("cascade-fanout");
  });

  it("结构性计数持续超标仍然报：中位数不是免死金牌", () => {
    const run = makeRun("measurement");
    const persistent: typeof run = {
      ...run,
      samples: [58, 61, 57, 60, 59].map((cascadeFanout) => ({
        commitDurationMs: 3,
        cascadeFanout,
      })),
    };
    expect(
      evaluateBudget({ run: persistent, component: "Form", budget: { maxCascadeFanout: 50 } }).map(
        (finding) => finding.rule,
      ),
    ).toContain("cascade-fanout");
  });

  it("时间指标仍按 p95 判定，尾部延迟不被中位数掩盖", () => {
    const run = makeRun("measurement");
    const spiky: typeof run = {
      ...run,
      samples: [10, 12, 400, 11, 13].map((longTaskMs) => ({ commitDurationMs: 3, longTaskMs })),
    };
    expect(
      evaluateBudget({ run: spiky, component: "Button", budget: { maxLongTaskMs: 100 } }).map(
        (finding) => finding.rule,
      ),
    ).toContain("long-task");
  });

});
