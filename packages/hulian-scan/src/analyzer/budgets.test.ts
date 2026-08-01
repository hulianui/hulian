import { describe, expect, it } from "vitest";

import type { FiberRenderEvent, ScenarioRun } from "../contracts";
import { evaluateBudget } from "./budgets";

function makeRun(
  stage: ScenarioRun["stage"],
  fibers: FiberRenderEvent[] = [],
): ScenarioRun {
  return {
    schemaVersion: 1,
    scenarioId: "button/basic",
    stage,
    environment: "workspace",
    samples: Array.from({ length: 5 }, () => ({ commitDurationMs: 3 })),
    events: [
      { type: "commit", commitId: 1, timestampMs: 1, durationMs: 3 },
      ...fibers,
    ],
    errors: [],
    metadata: {},
  };
}

function parentRender(
  selfDurationMs: number,
  changeDescription?: unknown,
): FiberRenderEvent {
  return {
    type: "fiber-render",
    commitId: 1,
    fiberId: 4,
    name: "Button",
    ownerName: "Fixture",
    depth: 1,
    actualDurationMs: selfDurationMs,
    selfDurationMs,
    stepId: "stable-parent-update",
    changeDescription,
  };
}

describe("evaluateBudget", () => {
  it("emits a diagnosis candidate for repeated parent-update renders", () => {
    const findings = evaluateBudget({
      run: makeRun("measurement", [parentRender(0.1), parentRender(0.1)]),
      component: "Button",
      budget: {
        minAvoidableRenderMs: 0.5,
        minRepeatedAvoidableRenders: 2,
      },
      minSamples: 5,
    });

    expect(findings).toEqual([
      expect.objectContaining({
        rule: "avoidable-render-candidate",
        severity: "warning",
        current: 2,
      }),
    ]);
  });

  it("promotes only unchanged diagnosis renders and ignores first mounts", () => {
    const unchanged = {
      isFirstMount: false,
      props: [],
      state: false,
      context: false,
      hooks: [],
      parent: true,
    };
    const firstMount = { ...unchanged, isFirstMount: true };
    const findings = evaluateBudget({
      run: makeRun("diagnosis", [
        parentRender(0.7, unchanged),
        parentRender(0.8, firstMount),
      ]),
      component: "Button",
      budget: { maxAvoidableRenderCount: 0 },
      minSamples: 5,
    });

    expect(findings).toEqual([
      expect.objectContaining({
        rule: "avoidable-render",
        severity: "error",
        current: 1,
      }),
    ]);
  });

  it("promotes reference changes that are safely equal by value", () => {
    const findings = evaluateBudget({
      run: makeRun("diagnosis", [
        parentRender(0.7, {
          isFirstMount: false,
          props: [
            {
              name: "items",
              previous: { id: 1, nested: ["stable"] },
              next: { id: 1, nested: ["stable"] },
            },
          ],
          state: false,
          context: false,
          hooks: [],
          parent: true,
        }),
      ]),
      component: "Button",
      budget: { maxAvoidableRenderCount: 0 },
      minSamples: 5,
    });

    expect(findings).toEqual([
      expect.objectContaining({ rule: "avoidable-render", current: 1 }),
    ]);
  });

  it("reports infrastructure failures before performance conclusions", () => {
    const run = makeRun("measurement");
    run.samples = [{ commitDurationMs: Number.NaN }];
    run.events = [];
    run.errors = ["scenario timeout"];

    expect(
      evaluateBudget({
        run,
        component: "Button",
        budget: {},
        minSamples: 5,
      }).map((finding) => finding.rule),
    ).toEqual([
      "scenario-error",
      "missing-commit",
      "insufficient-samples",
      "invalid-sample",
    ]);
  });
});
