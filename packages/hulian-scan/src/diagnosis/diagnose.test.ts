import { describe, expect, it } from "vitest";

import type { ScenarioRun } from "../contracts";
import { diagnoseRun } from "./diagnose";

describe("diagnoseRun", () => {
  it("attributes changed fields to an owner chain", () => {
    const run: ScenarioRun = {
      schemaVersion: 1,
      scenarioId: "button/basic",
      stage: "diagnosis",
      environment: "workspace",
      samples: [{ commitDurationMs: 1 }],
      events: [
        {
          type: "fiber-render",
          commitId: 1,
          fiberId: 3,
          name: "Button",
          ownerName: "Fixture",
          depth: 1,
          actualDurationMs: 1,
          selfDurationMs: 0.5,
          changeDescription: {
            props: ["items"],
            state: false,
            context: true,
            hooks: [2],
          },
        },
      ],
      errors: [],
      metadata: {},
    };

    expect(diagnoseRun(run)).toEqual([
      {
        fiberId: 3,
        component: "Button",
        ownerChain: ["Fixture", "Button"],
        props: {
          items: { kind: "changed", visitedEntries: 0, skipped: [] },
        },
        state: {},
        context: {
          context: { kind: "changed", visitedEntries: 0, skipped: [] },
        },
        hooks: {
          "2": { kind: "changed", visitedEntries: 0, skipped: [] },
        },
      },
    ]);
  });
});
