import { describe, expect, it } from "vitest";

import { isTimeRegression, summarize } from "./statistics";

describe("summarize", () => {
  it("computes a deterministic nearest-rank distribution", () => {
    expect(summarize([9, 1, 2, 4, 3])).toEqual({
      count: 5,
      median: 3,
      p95: 9,
      mad: 1,
    });
  });

  it.each([[[]], [[Number.NaN]], [[Number.POSITIVE_INFINITY]]])(
    "rejects invalid samples %#",
    (values) => {
      expect(() => summarize(values)).toThrow(/finite sample/);
    },
  );
});

describe("isTimeRegression", () => {
  it("fails only when relative and absolute thresholds both cross", () => {
    expect(
      isTimeRegression({
        baseline: 5,
        current: 7.1,
        relativePct: 20,
        absoluteMs: 2,
      }),
    ).toBe(true);
    expect(
      isTimeRegression({
        baseline: 5,
        current: 6.9,
        relativePct: 20,
        absoluteMs: 2,
      }),
    ).toBe(false);
    expect(
      isTimeRegression({
        baseline: 100,
        current: 119,
        relativePct: 20,
        absoluteMs: 2,
      }),
    ).toBe(false);
  });
});
