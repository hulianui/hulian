import { describe, expect, it } from "vitest";

import type { ScanEvent } from "@hulianui/hulian-scan/browser";

import { classifyGpuRenderer, computeMetrics } from "./window-api";

describe("classifyGpuRenderer", () => {
  it("distinguishes software rasterizers from native hardware", () => {
    expect(classifyGpuRenderer("ANGLE (Google, SwiftShader Device)")).toBe("software");
    expect(classifyGpuRenderer("ANGLE (Apple, ANGLE Metal Renderer: Apple M1 Pro)")).toBe(
      "hardware",
    );
    expect(classifyGpuRenderer(undefined)).toBe("unavailable");
  });
});

describe("computeMetrics", () => {
  it("keeps mount fanout separate from update cascade fanout", () => {
    const events: ScanEvent[] = [
      { type: "commit", commitId: 1, timestampMs: 1, durationMs: 4, stepId: "mount" },
      ...Array.from({ length: 80 }, (_, index) => ({
        type: "fiber-render" as const,
        commitId: 1,
        fiberId: index,
        name: `Mount${index}`,
        depth: 1,
        actualDurationMs: 0.1,
        selfDurationMs: 0.1,
        stepId: "mount",
      })),
      { type: "commit", commitId: 2, timestampMs: 2, durationMs: 1, stepId: "interaction:open" },
      ...Array.from({ length: 7 }, (_, index) => ({
        type: "fiber-render" as const,
        commitId: 2,
        fiberId: 100 + index,
        name: `Update${index}`,
        depth: 1,
        actualDurationMs: 0.1,
        selfDurationMs: 0.1,
        stepId: "interaction:open",
      })),
    ];

    expect(
      computeMetrics(events, {
        interactionDurations: [],
        longTaskDurations: [],
        frameDurations: [],
      }),
    ).toMatchObject({ mountFanout: 80, cascadeFanout: 7 });
  });
});
