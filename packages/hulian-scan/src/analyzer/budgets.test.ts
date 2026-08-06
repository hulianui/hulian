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
        // warning 而不是 error：这条只是发现信号。判据见 budgets.ts 里那段长注释 ——
        // 没有 memo 的组件（全库 306/380）恒满足它，且检测本身被挂载期异步工作污染，
        // 对已 memo 的组件也会误报。真正的门禁在 packages/ui/test/memo-guard.tsx。
        severity: "warning",
        current: 1,
      }),
    ]);
  });

  it("ignores reference changes that are merely equal by value", () => {
    // 值相同但引用不同 —— React 的 bailout 走 Object.is，这次渲染它避免不了，
    // 加 memo 也消不掉。报出来只会是不可执行的 finding（34 个组件实测已验证）。
    // 该修的是传新引用的调用方，不是这个组件。
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

    expect(findings.filter((finding) => finding.rule === "avoidable-render")).toEqual([]);
  });

  it("still promotes renders whose props kept the very same reference", () => {
    // known-bad fixture 的形态：模块级常量传给无 memo 的子组件 —— 引用没变却重算，
    // 这才是该报的那类。收紧判据后这条防线必须还在。
    const stable = { id: 1, nested: ["stable"] };
    const findings = evaluateBudget({
      run: makeRun("diagnosis", [
        parentRender(0.7, {
          isFirstMount: false,
          props: [{ name: "config", previous: stable, next: stable }],
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

  // fanout 已改成 step 聚合、切片因素消除，但「跨机器可比」还没有 CI 侧实测背书，
  // 所以跨机器时**暂缓**判定 —— 是暂缓，不是结论反转。等 CI 侧读数与本机对照完成后，
  // 这条与下面那条基线回归的断言一起翻成 toContain。
  it("跨机器：trustTimingMetrics=false 暂缓 fanout 判定（待 CI 侧实测新定义读数）", () => {
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

  // 基线与读数是同一个定义，所以 fanout 的基线回归必须与它的阈值判定同进退：
  // 同机器可信时判，暂缓期跟着一起跳过。两半会在恢复门禁那一步同时翻。
  it("fanout 的基线回归与阈值判定同口径：可信时判，暂缓期一起跳过", () => {
    const run = makeRun("measurement");
    const wide: typeof run = {
      ...run,
      environment: "packed-consumer",
      samples: Array.from({ length: 5 }, () => ({ commitDurationMs: 3, cascadeFanout: 400 })),
    };
    expect(
      evaluateBudget({
        run: wide,
        component: "Button",
        budget: {},
        baseline: { cascadeFanout: 100 },
      }).map((finding) => finding.rule),
    ).toContain("regression:cascadeFanout");
    expect(
      evaluateBudget({
        run: wide,
        component: "Button",
        budget: { trustTimingMetrics: false },
        baseline: { cascadeFanout: 100 },
      }).map((finding) => finding.rule),
    ).not.toContain("regression:cascadeFanout");
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
