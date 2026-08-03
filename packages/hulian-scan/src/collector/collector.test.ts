import { describe, expect, it } from "vitest";

import { createCollector } from "./collector";

describe("createCollector", () => {
  it("collects normalized commits and closes valid step windows", () => {
    const collector = createCollector();
    collector.beginStep("mount", 10);
    collector.accept({
      type: "commit",
      commitId: 1,
      timestampMs: 11,
      durationMs: 2,
    });
    collector.endStep("mount", 14);

    expect(collector.finalize()).toEqual({
      events: [
        {
          type: "commit",
          commitId: 1,
          timestampMs: 11,
          durationMs: 2,
          stepId: "mount",
        },
      ],
      errors: [],
    });
  });

  it("reports invalid windows, open steps, and missing commits", () => {
    const collector = createCollector();
    collector.beginStep("duplicate", 10);
    collector.beginStep("duplicate", 11);
    collector.endStep("missing", 12);
    collector.beginStep("backwards", 20);
    collector.endStep("backwards", 19);

    expect(collector.finalize().errors).toEqual([
      "step already open: duplicate",
      "invalid step window: missing",
      "invalid step window: backwards",
      "step not closed: duplicate",
      "no React commit captured",
    ]);
  });

  it("按发生时刻归属：整批迟到的 mount commit 不算进下一步", () => {
    const collector = createCollector();
    collector.beginStep("mount", 10);
    collector.endStep("mount", 20);
    collector.beginStep("stable-parent-update", 21);
    // React 把 commit 与其 fiber 渲染整批 sink，慢机器上这一批迟到了：
    // 到达时 mount 窗口已关闭，但 commit 自己的时间戳 12 明确落在 mount 里。
    collector.accept({ type: "commit", commitId: 7, timestampMs: 12, durationMs: 3 });
    collector.accept({
      type: "fiber-render",
      commitId: 7,
      name: "ExpensiveChildView",
      depth: 1,
      actualDurationMs: 3,
      selfDurationMs: 3,
    });
    collector.endStep("stable-parent-update", 30);

    const { events } = collector.finalize();
    expect(events.map((event) => event.stepId)).toEqual(["mount", "mount"]);
  });

  it("fiber 渲染跟随其 commit 的归属，不各算各的", () => {
    const collector = createCollector();
    collector.beginStep("mount", 0);
    collector.accept({ type: "commit", commitId: 1, timestampMs: 1, durationMs: 1 });
    collector.endStep("mount", 5);
    collector.beginStep("update", 6);
    collector.accept({ type: "commit", commitId: 2, timestampMs: 7, durationMs: 1 });
    collector.accept({
      type: "fiber-render",
      commitId: 1,
      name: "Late",
      depth: 0,
      actualDurationMs: 1,
      selfDurationMs: 1,
    });
    collector.endStep("update", 9);

    const { events } = collector.finalize();
    expect(events.map((event) => [event.type, event.stepId])).toEqual([
      ["commit", "mount"],
      ["commit", "update"],
      ["fiber-render", "mount"],
    ]);
  });

  it("落在任何窗口之外的 commit 不打标签", () => {
    const collector = createCollector();
    collector.beginStep("mount", 10);
    collector.endStep("mount", 20);
    collector.accept({ type: "commit", commitId: 3, timestampMs: 50, durationMs: 1 });

    expect(collector.finalize().events[0]!.stepId).toBeUndefined();
  });

});
