import { describe, expect, it } from "vitest";

import type { ScanReport } from "./contracts";
import { parseCliArgs, runCli } from "./cli";

function report(findings: ScanReport["findings"] = []): ScanReport {
  return {
    schemaVersion: 1,
    environment: "workspace",
    runs: [],
    findings,
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
});
