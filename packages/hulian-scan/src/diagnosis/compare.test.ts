import { describe, expect, it } from "vitest";

import { compareValues } from "./compare";

describe("compareValues", () => {
  it("classifies equal deep values and never invokes getters", () => {
    let reads = 0;
    const left = {
      stable: { n: 1 },
      get danger() {
        reads += 1;
        return 1;
      },
    };
    const right = {
      stable: { n: 1 },
      get danger() {
        reads += 1;
        return 1;
      },
    };

    const change = compareValues(left, right, {
      maxDepth: 6,
      maxEntries: 200,
    });

    expect(change.kind).toBe("equal-by-value");
    expect(change.skipped).toContain("getter:danger");
    expect(reads).toBe(0);
  });

  it("terminates on cycles, collections, functions, and React elements", () => {
    const left: Record<string, unknown> = {};
    const right: Record<string, unknown> = {};
    left.self = left;
    right.self = right;
    left.map = new Map([[{ id: 1 }, new Set([1, 2])]]);
    right.map = new Map([[{ id: 1 }, new Set([1, 2])]]);
    left.fn = () => 1;
    right.fn = () => 1;
    left.element = { $$typeof: Symbol.for("react.transitional.element") };
    right.element = { $$typeof: Symbol.for("react.transitional.element") };

    const change = compareValues(left, right, {
      maxDepth: 6,
      maxEntries: 200,
    });

    expect(change.kind).toBe("changed");
    expect(change.visitedEntries).toBeLessThanOrEqual(200);
  });

  it("returns truncated at either configured boundary", () => {
    expect(
      compareValues({ nested: { value: 1 } }, { nested: { value: 1 } }, {
        maxDepth: 1,
        maxEntries: 200,
      }).kind,
    ).toBe("truncated");
    expect(
      compareValues([1, 2, 3], [1, 2, 3], {
        maxDepth: 6,
        maxEntries: 2,
      }).kind,
    ).toBe("truncated");
  });
});
