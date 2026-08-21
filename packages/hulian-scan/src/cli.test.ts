import { describe, expect, it } from "vitest";

import type { ScanReport } from "./contracts";
import { parseCliArgs, runCli } from "./cli";

function report(
  findings: ScanReport["findings"] = [],
  failures: ScanReport["failures"] = [],
): ScanReport {
  return {
    schemaVersion: 1,
    environment: "workspace",
    runs: [],
    findings,
    failures,
  };
}

describe("parseCliArgs", () => {
  it("parses the complete supported flag surface", () => {
    expect(
      parseCliArgs([
        "--",
        "--scenario",
        "button/basic",
        "--ci",
        "--resume",
        "--environment",
        "packed-consumer",
        "--react",
        "19",
        "--output",
        "custom-output",
        "--from-baseline",
        "baseline.json",
        "--report-only",
      ]),
    ).toEqual(
      expect.objectContaining({
        scenarioIds: ["button/basic"],
        ci: true,
        resume: true,
        environment: "packed-consumer",
        react: "19",
        outputDir: "custom-output",
        fromBaseline: "baseline.json",
        reportOnly: true,
      }),
    );
  });

  it("rejects conflicting and unsafe modes", () => {
    expect(() => parseCliArgs(["--full", "--scenario", "button/basic"])).toThrow(/--full/);
    expect(() => parseCliArgs(["--update"])).toThrow(/--from/);
    expect(() => parseCliArgs(["--update", "--from", "summary.json", "--react", "18"])).toThrow(
      /React 19/,
    );
    expect(() => parseCliArgs(["--smoke", "--react", "19"])).toThrow(/React 18/);
  });
});

describe("runCli", () => {
  it("uses findings as the CI exit code but report-only ignores them", async () => {
    const finding = {
      id: "button:slow:Button",
      scenarioId: "button/basic",
      component: "Button",
      rule: "slow",
      severity: "error" as const,
      current: 4,
      evidence: ["slow"],
    };
    const execute = async () => report([finding]);

    await expect(runCli(["--scenario", "button/basic", "--ci"], { execute })).resolves.toBe(1);
    await expect(
      runCli(["--scenario", "button/basic", "--ci", "--report-only"], { execute }),
    ).resolves.toBe(0);
  });

  // 只有 error 级才判失败。此前是「有任何 finding 就退 1」，于是 severity 字段形同虚设 ——
  // 一条会让构建变红的 warning 不是 warning。发现类信号（avoidable-render 等）照常进报告。
  it("only fails CI on error-severity findings", async () => {
    const warning = {
      id: "kbd/basic:avoidable-render:Kbd",
      scenarioId: "kbd/basic",
      component: "Kbd",
      rule: "avoidable-render",
      severity: "warning" as const,
      current: 3,
      evidence: ["GenericFixture -> Kbd in stress:stable-parent-update"],
    };
    const error = { ...warning, id: "kbd/basic:leak:Kbd", rule: "leak", severity: "error" as const };

    await expect(
      runCli(["--scenario", "kbd/basic", "--ci"], { execute: async () => report([warning]) }),
    ).resolves.toBe(0);
    await expect(
      runCli(["--scenario", "kbd/basic", "--ci"], {
        execute: async () => report([warning, error]),
      }),
    ).resolves.toBe(1);
  });

  // 场景失败被隔离进报告是为了保住其余场景的读数，**不是**为了把失败咽下去。
  // 一个组件这一轮压根没被扫到，必须有人看见。
  it("fails CI when a scenario produced no usable measurement", async () => {
    const failure = {
      scenarioId: "faulty-terminal/frame-budget",
      stage: "measurement" as const,
      reason: "scenario timeout after 30000 ms",
    };

    await expect(
      runCli(["--scenario", "faulty-terminal/frame-budget", "--ci"], {
        execute: async () => report([], [failure]),
      }),
    ).resolves.toBe(1);
    await expect(
      runCli(["--scenario", "faulty-terminal/frame-budget", "--ci", "--report-only"], {
        execute: async () => report([], [failure]),
      }),
    ).resolves.toBe(0);
  });
});
