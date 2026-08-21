import { describe, expect, it } from "vitest";

import type { ScanReport } from "../contracts";
import { baselineFromReport, parsePerformanceBaseline } from "./baseline";

describe("performance baseline", () => {
  it("rejects an empty baseline when CI requires comparison evidence", () => {
    expect(() =>
      parsePerformanceBaseline(
        { schemaVersion: 1, react: "19.2.8", environment: "packed-consumer", scenarios: {} },
        { requireNonEmpty: true },
      ),
    ).toThrow(/baseline.*empty/i);
  });

  it("stores medians and excludes scenarios with hard violations", () => {
    const report: ScanReport = {
      schemaVersion: 1,
      environment: "packed-consumer",
      runs: [
        {
          schemaVersion: 1,
          scenarioId: "button/basic",
          stage: "measurement",
          environment: "packed-consumer",
          samples: [1, 2, 3, 4, 5].map((commitDurationMs) => ({ commitDurationMs })),
          events: [{ type: "commit", commitId: 1, timestampMs: 1, durationMs: 1 }],
          errors: [],
          metadata: {},
        },
        {
          schemaVersion: 1,
          scenarioId: "select/stress",
          stage: "measurement",
          environment: "packed-consumer",
          samples: Array.from({ length: 5 }, () => ({ commitDurationMs: 70 })),
          events: [{ type: "commit", commitId: 1, timestampMs: 1, durationMs: 70 }],
          errors: [],
          metadata: {},
        },
      ],
      findings: [
        {
          id: "select/stress:long-task:Select",
          scenarioId: "select/stress",
          component: "Select",
          rule: "long-task",
          severity: "error",
          current: 70,
          evidence: ["hard violation"],
        },
      ],
      failures: [],
    };

    expect(baselineFromReport(report).scenarios).toEqual({
      "button/basic": { commitDurationMs: 3 },
    });
  });

  it("never freezes software-GPU WebGL metrics as a release baseline", () => {
    const report: ScanReport = {
      schemaVersion: 1,
      environment: "packed-consumer",
      runs: [
        {
          schemaVersion: 1,
          scenarioId: "shader/frame-budget",
          stage: "measurement",
          environment: "packed-consumer",
          samples: Array.from({ length: 5 }, () => ({ longTaskMs: 400 })),
          events: [{ type: "commit", commitId: 1, timestampMs: 1, durationMs: 1 }],
          errors: [],
          metadata: { webgl: true, gpuMode: "software", gpuMetricsTrusted: false },
        },
      ],
      findings: [],
      failures: [],
    };

    expect(baselineFromReport(report).scenarios).toEqual({});
  });
});
