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
});
