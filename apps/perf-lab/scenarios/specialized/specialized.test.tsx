import { describe, expect, it } from "vitest";

import { specializedScenarios } from "./index";
import { createAnimationScenario } from "./animation";

describe("specialized performance scenarios", () => {
  it("pins the heavy-component dataset scales", () => {
    expect(specializedScenarios.table.parameters.rows).toBe(1_000);
    expect(specializedScenarios.proTable.parameters.rows).toBe(1_000);
    expect(specializedScenarios.tree.parameters.nodes).toBe(1_000);
    expect(specializedScenarios.virtualList.parameters.items).toBe(10_000);
    expect(specializedScenarios.select.parameters.options).toBe(1_000);
    expect(specializedScenarios.chart.parameters.points).toBe(500);
    expect(specializedScenarios.markdownEditor.parameters.characters).toBe(20_000);
  });

  it("keeps the animation lifecycle explicit", () => {
    expect(specializedScenarios.animation.scenario.steps.map((step) => step.id)).toEqual([
      "start",
      "sample-frames",
      "stop",
      "unmount-observe",
    ]);
  });

  it("applies the same 120-frame lifecycle to every classified public animation", async () => {
    const scenario = await createAnimationScenario(
      {
        id: "animated-beam",
        scenarioId: "animated-beam/frame-budget",
        component: "AnimatedBeam",
        entry: "@hulianui/ui/animated-beam",
        category: "animation",
        categories: ["decoration"],
        animated: true,
        webgl: false,
        source: "packages/ui/src/animated-beam/index.ts",
      },
      {
        controls: [],
        states: [{ name: "default", render: () => <div /> }],
        renderWithProps: () => <div />,
        toCode: () => "<AnimatedBeam />",
      },
    );

    expect(scenario.steps.map((step) => step.id)).toEqual([
      "start",
      "sample-frames",
      "stop",
      "unmount-observe",
    ]);
  });
});
