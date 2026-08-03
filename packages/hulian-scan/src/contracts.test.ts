import { describe, expect, it } from "vitest";

import { definePerformanceScenario } from "./contracts";

describe("definePerformanceScenario", () => {
  it("rejects duplicate step ids", () => {
    expect(() =>
      definePerformanceScenario({
        id: "button/basic",
        component: "Button",
        entry: "@hulianui/ui/button",
        category: "standard",
        render: () => null,
        steps: [
          {
            id: "stable-parent",
            kind: "parent-update",
            run: async () => undefined,
          },
          {
            id: "stable-parent",
            kind: "props-update",
            run: async () => undefined,
          },
        ],
        budgets: {},
      }),
    ).toThrow("duplicate step id: stable-parent");
  });

  it("requires labels for interaction steps", () => {
    expect(() =>
      definePerformanceScenario({
        id: "button/click",
        component: "Button",
        entry: "@hulianui/ui/button",
        category: "standard",
        render: () => null,
        steps: [
          {
            id: "click",
            kind: "interaction",
            run: async () => undefined,
          },
        ],
        budgets: {},
      }),
    ).toThrow("interaction label required: click");
  });

  it("freezes a valid scenario", () => {
    const scenario = definePerformanceScenario({
      id: "button/basic",
      component: "Button",
      entry: "@hulianui/ui/button",
      category: "standard",
      render: () => null,
      steps: [
        {
          id: "mount",
          kind: "mount",
          run: async () => undefined,
        },
      ],
      budgets: {},
    });

    expect(Object.isFrozen(scenario)).toBe(true);
  });
});
