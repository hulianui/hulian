import { describe, it, expect } from "vitest";
import { skeletonVariants } from "./skeleton";

describe("skeletonVariants", () => {
  it("默认 text 形态", () => {
    expect(skeletonVariants({})).toContain("rounded");
  });
  it("circle 形态全圆", () => {
    expect(skeletonVariants({ shape: "circle" })).toContain("rounded-full");
  });
});
