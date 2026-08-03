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

const EMPTY_OBSERVATION = {
  interactionDurations: [],
  longTaskDurations: [],
  frameDurations: [],
};

function withStep<T extends object>(event: T, stepId: string | undefined): T {
  return stepId === undefined ? event : { ...event, stepId };
}

/** 一个 commit 首次渲染 count 个全新 fiber —— first-seen 的 fiber 算挂载工作。 */
function mountCommit(
  stepId: string | undefined,
  commitId: number,
  firstFiberId: number,
  count: number,
): ScanEvent[] {
  return [
    withStep({ type: "commit" as const, commitId, timestampMs: commitId, durationMs: 1 }, stepId),
    ...Array.from({ length: count }, (_, index) =>
      withStep(
        {
          type: "fiber-render" as const,
          commitId,
          fiberId: firstFiberId + index,
          name: `Fiber${firstFiberId + index}`,
          depth: 1,
          actualDurationMs: 0.1,
          selfDurationMs: 0.1,
        },
        stepId,
      ),
    ),
  ];
}

/**
 * 一个 step 内的若干更新 commit。前面先挂载同一批 fiber：已见过的 fiber 才算级联更新，
 * 否则会被归到 mountFanout。
 */
function updateStep(
  stepId: string | undefined,
  commits: Array<{ commitId: number; fibers: number }>,
): ScanEvent[] {
  const base = commits[0]!.commitId * 1000;
  return [
    ...mountCommit("mount", base, base, Math.max(...commits.map((commit) => commit.fibers))),
    ...commits.flatMap((commit) => [
      withStep(
        {
          type: "commit" as const,
          commitId: commit.commitId,
          timestampMs: commit.commitId,
          durationMs: 1,
        },
        stepId,
      ),
      ...Array.from({ length: commit.fibers }, (_, index) =>
        withStep(
          {
            type: "fiber-render" as const,
            commitId: commit.commitId,
            fiberId: base + index,
            name: `Fiber${base + index}`,
            depth: 1,
            actualDurationMs: 0.1,
            selfDurationMs: 0.1,
          },
          stepId,
        ),
      ),
    ]),
  ];
}

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
        fiberId: index,
        name: `Update${index}`,
        depth: 1,
        actualDurationMs: 0.1,
        selfDurationMs: 0.1,
        stepId: "interaction:open",
      })),
      ...Array.from({ length: 40 }, (_, index) => ({
        type: "fiber-render" as const,
        commitId: 2,
        fiberId: 100 + index,
        name: `PopupMount${index}`,
        depth: 1,
        actualDurationMs: 0.1,
        selfDurationMs: 0.1,
        stepId: "interaction:open",
      })),
    ];

    expect(computeMetrics(events, EMPTY_OBSERVATION)).toMatchObject({
      mountFanout: 80,
      cascadeFanout: 7,
    });
  });

  // 定义改造：fanout = 一个 step 内所有更新 commit 的 fiber 总数。
  // concurrent React 切几个 commit 取决于机器快慢，按单个 commit 计数等于在量机器。
  it("sums fanout across every commit inside one step, so slicing cannot change the reading", () => {
    const sliced = updateStep("interaction:open", [
      { commitId: 2, fibers: 12 },
      { commitId: 3, fibers: 11 },
      { commitId: 4, fibers: 8 },
    ]);
    const whole = updateStep("interaction:open", [{ commitId: 2, fibers: 31 }]);

    // 同样 31 个 fiber 的更新，切三刀与不切读数必须一致。
    expect(computeMetrics(sliced, EMPTY_OBSERVATION).cascadeFanout).toBe(31);
    expect(computeMetrics(whole, EMPTY_OBSERVATION).cascadeFanout).toBe(31);
  });

  it("keeps steps separate: the metric is the worst step, not the whole run", () => {
    const events = [
      ...updateStep("interaction:open", [
        { commitId: 2, fibers: 12 },
        { commitId: 3, fibers: 11 },
      ]),
      ...updateStep("interaction:close", [{ commitId: 4, fibers: 9 }]),
    ];

    // 23 + 9 = 32 是整轮总量；指标取最差的那个 step，是 23。
    expect(computeMetrics(events, EMPTY_OBSERVATION).cascadeFanout).toBe(23);
  });

  it("mount fanout also sums within a step: a sliced mount is one mount", () => {
    const events = [
      ...mountCommit("mount", 1, 0, 40),
      ...mountCommit("mount", 2, 40, 35),
      ...mountCommit("interaction:open", 3, 200, 20),
    ];

    expect(computeMetrics(events, EMPTY_OBSERVATION)).toMatchObject({
      mountFanout: 75,
      cascadeFanout: 0,
    });
  });

  // 窗口重叠或落在窗口外时 collector 不打 stepId。这些 commit 互不相干，
  // 并进同一个桶会累加出一个假的巨大 fanout —— 它们必须各自成桶。
  it("does not merge step-less commits into one bucket", () => {
    const events = [
      ...updateStep("interaction:open", [{ commitId: 2, fibers: 6 }]),
      ...updateStep(undefined, [
        { commitId: 3, fibers: 5 },
        { commitId: 4, fibers: 5 },
        { commitId: 5, fibers: 5 },
      ]),
    ];

    expect(computeMetrics(events, EMPTY_OBSERVATION).cascadeFanout).toBe(6);
  });

  it("still ignores unmount teardown renders", () => {
    const events = [
      ...updateStep("interaction:open", [{ commitId: 2, fibers: 6 }]),
      ...updateStep("unmount", [
        { commitId: 3, fibers: 30 },
        { commitId: 4, fibers: 30 },
      ]),
    ];

    expect(computeMetrics(events, EMPTY_OBSERVATION).cascadeFanout).toBe(6);
  });
});
