// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ShowcaseSpec } from "@hulianui/ui";

import { createGenericScenario } from "./generic";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const roots: Array<ReturnType<typeof createRoot>> = [];

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = "";
});

function metadata() {
  return {
    id: "button",
    scenarioId: "button/basic",
    component: "Button",
    entry: "@hulianui/ui/button",
    category: "core" as const,
    categories: ["input"],
    animated: false,
    webgl: false,
    source: "packages/ui/src/button/index.ts",
  };
}

describe("createGenericScenario", () => {
  it("uses the first example and exposes the six-step lifecycle", async () => {
    const exampleRender = vi.fn(() => <button>example</button>);
    const showcase: ShowcaseSpec = {
      controls: [],
      states: [{ name: "fallback", render: () => <button>state</button> }],
      examples: [{ title: "basic", code: "<Button />", render: exampleRender }],
      renderWithProps: () => <button>props</button>,
      toCode: () => "<Button />",
    };
    const scenario = await createGenericScenario(metadata(), showcase);

    expect(scenario.steps.map((step) => step.kind)).toEqual([
      "mount",
      "parent-update",
      "props-update",
      "interaction",
      "stress",
      "unmount",
    ]);

    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    roots.push(root);
    await act(async () => root.render(scenario.render() as React.ReactNode));
    expect(exampleRender).toHaveBeenCalled();

    const parentStep = scenario.steps.find((step) => step.kind === "parent-update");
    await act(async () => parentStep?.run());
    expect(
      container
        .querySelector("[data-hulian-scan-parent-tick]")
        ?.getAttribute("data-hulian-scan-parent-tick"),
    ).toBe("1");
  });

  it("falls back to the first state and names inapplicable steps", async () => {
    const stateRender = vi.fn(() => <output>state</output>);
    const showcase: ShowcaseSpec = {
      controls: [],
      states: [{ name: "default", render: stateRender }],
      renderWithProps: () => <output>props</output>,
      toCode: () => "<Output />",
    };
    const scenario = await createGenericScenario(metadata(), showcase);

    expect(scenario.steps.find((step) => step.kind === "props-update")?.id).toMatch(
      /not-applicable/,
    );
    expect(scenario.render()).toBeTruthy();
  });
});
