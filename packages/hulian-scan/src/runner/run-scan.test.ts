import { describe, expect, it, vi } from "vitest";

import type { Finding, ScenarioRun } from "../contracts";
import { runScan, type RunDependencies, type RunScanOptions } from "./run-scan";

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
      mutate: (value: ScenarioRun) => {
        value.events = [];
      },
    },
    {
      name: "NaN sample",
      mutate: (value: ScenarioRun) => {
        value.samples[0] = { commitDurationMs: Number.NaN };
      },
    },
    {
      name: "insufficient samples",
      mutate: (value: ScenarioRun) => {
        value.samples = value.samples.slice(0, 4);
      },
    },
    {
      name: "scenario timeout",
      mutate: (value: ScenarioRun) => {
        value.errors = ["scenario timeout after 10000 ms"];
      },
    },
  ])("treats $name as an infrastructure failure", async ({ mutate }) => {
    const invalid = run("fixture/known-good", "measurement");
    mutate(invalid);
    const deps: RunDependencies = {
      runStage: async () => [invalid, run("fixture/known-bad", "measurement")],
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
