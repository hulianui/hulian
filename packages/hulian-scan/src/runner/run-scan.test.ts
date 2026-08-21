import { describe, expect, it, vi } from "vitest";

import type { Finding, ScenarioRun } from "../contracts";
import { isBrowserCrash, runScan, type RunDependencies, type RunScanOptions } from "./run-scan";

function options(): RunScanOptions {
  return {
    scenarioIds: ["fixture/known-good", "fixture/known-bad"],
    environment: "workspace",
    samples: 5,
    warmups: 1,
    checkpointPath: ".hulian-scan/checkpoint.json",
    outputDir: ".hulian-scan/test",
    resume: false,
  };
}

function run(scenarioId: string, stage: ScenarioRun["stage"]): ScenarioRun {
  return {
    schemaVersion: 1,
    scenarioId,
    stage,
    environment: "workspace",
    samples: Array.from({ length: 5 }, () => ({ commitDurationMs: 2 })),
    events: [{ type: "commit", commitId: 1, timestampMs: 1, durationMs: 2 }],
    errors: [],
    metadata: {},
  };
}

function finding(scenarioId: string): Finding {
  return {
    id: `${scenarioId}:avoidable-render-candidate:Fixture`,
    scenarioId,
    component: "Fixture",
    rule: "avoidable-render-candidate",
    severity: "warning",
    current: 2,
    evidence: ["candidate"],
  };
}

// 这条判据决定异常往哪走：整轮重试（浏览器没了）还是隔离成单个场景的失败
// （runBrowserStage 的 per-scenario catch）。判错任一侧的代价都是整轮报告丢失 ——
// 判成场景失败，一次可恢复的崩溃会被放大成几百条噪声；判成崩溃，一个超时的场景
// 会让整轮白跑第二遍再挂。
describe("isBrowserCrash", () => {
  it.each([
    "Target page, context or browser has been closed",
    "browserContext.newPage: Browser closed",
    "chromium crashed",
  ])("treats %s as a browser-level crash", (message) => {
    expect(isBrowserCrash(message)).toBe(true);
  });

  it.each([
    "faulty-terminal/frame-budget exceeded outer browser timeout (240000 ms)",
    "scenario timeout after 30000 ms",
    "page.evaluate: Error: unknown performance scenario: does-not-exist",
    "animation RAF survived unmount",
    // 页面级的协议中断刻意归到场景侧：死的可能只有这一个 page，为它把整轮（全量 77 分钟）
    // 重跑一遍太贵。浏览器要是真没了，下一个场景的 context.newPage() 会抛
    // "Browser closed"，那一条命中上面的判据、照常触发整轮重试 —— 代价只是多一条
    // 无谓的场景失败记录，而且会自愈。
    "Protocol error: Connection closed. Most likely the page has been closed.",
  ])("treats %s as a single-scenario failure", (message) => {
    expect(isBrowserCrash(message)).toBe(false);
  });
});

describe("runScan", () => {
  it("diagnoses only measurement failures and retries a browser crash once", async () => {
    let launches = 0;
    const calls: Array<{ stage: string; ids: string[] }> = [];
    const deps: RunDependencies = {
      runStage: vi.fn(async (stage: ScenarioRun["stage"], scenarioIds: string[]) => {
        calls.push({ stage, ids: scenarioIds });
        launches += 1;
        if (launches === 1) throw new Error("browser disconnected after crash");
        return scenarioIds.map((id) => run(id, stage));
      }),
      analyze: (runs) =>
        runs
          .filter((entry) => entry.scenarioId.endsWith("known-bad"))
          .map((entry) => finding(entry.scenarioId)),
      attachDiagnosis: (findings) => findings,
      write: vi.fn(async () => undefined),
    };

    const report = await runScan(options(), deps);

    expect(report.findings).toHaveLength(1);
    expect(calls).toEqual([
      { stage: "measurement", ids: options().scenarioIds },
      { stage: "measurement", ids: options().scenarioIds },
      { stage: "diagnosis", ids: ["fixture/known-bad"] },
    ]);
    expect(deps.write).toHaveBeenCalledOnce();
  });

  it.each([
    {
      name: "no commit",
      reason: "no React commit captured",
      mutate: (value: ScenarioRun) => {
        value.events = [];
      },
    },
    {
      name: "NaN sample",
      reason: "non-finite sample",
      mutate: (value: ScenarioRun) => {
        value.samples[0] = { commitDurationMs: Number.NaN };
      },
    },
    {
      name: "insufficient samples",
      reason: "insufficient samples (4/5)",
      mutate: (value: ScenarioRun) => {
        value.samples = value.samples.slice(0, 4);
      },
    },
    {
      name: "scenario timeout",
      reason: "scenario timeout after 10000 ms",
      mutate: (value: ScenarioRun) => {
        value.errors = ["scenario timeout after 10000 ms"];
      },
    },
  ])("quarantines $name without discarding the other scenarios", async ({ mutate, reason }) => {
    const invalid = run("fixture/known-good", "measurement");
    mutate(invalid);
    const analyze = vi.fn(() => []);
    const deps: RunDependencies = {
      runStage: async () => [invalid, run("fixture/known-bad", "measurement")],
      analyze,
      attachDiagnosis: (findings) => findings,
      write: async () => undefined,
    };

    const report = await runScan(options(), deps);

    // 关键断言：坏的那个进 failures，好的那个照常进 runs 并被分析。
    // 2026-08-19 的 weekly sweep 是这条的反面教材 —— 391 个场景里坏了 1 个，
    // 另外 390 个的报告连同 77 分钟机时一起没了。
    expect(report.failures).toEqual([
      { scenarioId: "fixture/known-good", stage: "measurement", reason },
    ]);
    expect(report.runs.map((entry) => entry.scenarioId)).toEqual(["fixture/known-bad"]);
    expect(analyze).toHaveBeenCalledWith([
      expect.objectContaining({ scenarioId: "fixture/known-bad" }),
    ]);
  });

  it("keeps a clean run's failures empty", async () => {
    const deps: RunDependencies = {
      runStage: async (stage, scenarioIds) => scenarioIds.map((id) => run(id, stage)),
      analyze: () => [],
      attachDiagnosis: (findings) => findings,
      write: async () => undefined,
    };

    expect((await runScan(options(), deps)).failures).toEqual([]);
  });

  it("quarantines a scenario the diagnosis stage fails to re-measure", async () => {
    const broken = run("fixture/known-bad", "diagnosis");
    broken.errors = ["scenario timeout after 10000 ms"];
    const deps: RunDependencies = {
      runStage: async (stage, scenarioIds) =>
        stage === "diagnosis" ? [broken] : scenarioIds.map((id) => run(id, stage)),
      analyze: (runs) =>
        runs
          .filter((entry) => entry.scenarioId.endsWith("known-bad"))
          .map((entry) => finding(entry.scenarioId)),
      attachDiagnosis: (findings) => findings,
      write: async () => undefined,
    };

    const report = await runScan(options(), deps);

    expect(report.failures).toEqual([
      {
        scenarioId: "fixture/known-bad",
        stage: "diagnosis",
        reason: "scenario timeout after 10000 ms",
      },
    ]);
    // 测量阶段的读数没有被诊断阶段的失败牵连。
    expect(report.runs).toHaveLength(2);
  });

  it.each([
    { name: "duplicate", runs: ["fixture/known-good", "fixture/known-good"] },
    { name: "unexpected", runs: ["fixture/known-good", "fixture/never-requested"] },
  ])("still aborts on a $name scenario id", async ({ runs: ids }) => {
    // runner 把结果串了 —— 这时候没有哪条读数能确定属于谁，隔离单个场景是错的。
    const deps: RunDependencies = {
      runStage: async () => ids.map((id) => run(id, "measurement")),
      analyze: () => [],
      attachDiagnosis: (findings) => findings,
      write: async () => undefined,
    };

    await expect(runScan(options(), deps)).rejects.toThrow(/infrastructure/);
  });

  it("does not retry assertion or timeout failures", async () => {
    let attempts = 0;
    const deps: RunDependencies = {
      runStage: async () => {
        attempts += 1;
        throw new Error("scenario timeout");
      },
      analyze: () => [],
      attachDiagnosis: (findings) => findings,
      write: async () => undefined,
    };

    await expect(runScan(options(), deps)).rejects.toThrow("scenario timeout");
    expect(attempts).toBe(1);
  });
});
