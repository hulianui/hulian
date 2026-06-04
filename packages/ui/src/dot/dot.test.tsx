import { describe, it, expect } from "vitest";
import { dotVariants } from "./dot";

describe("dotVariants", () => {
  it("默认 = md（size-2）", () => {
    expect(dotVariants({})).toContain("size-2");
  });
  it("sm / lg 切换尺寸", () => {
    expect(dotVariants({ size: "sm" })).toContain("size-1.5");
    expect(dotVariants({ size: "lg" })).toContain("size-2.5");
  });
  it("恒为圆形 + 不收缩", () => {
    const c = dotVariants({});
    expect(c).toContain("rounded-full");
    expect(c).toContain("shrink-0");
  });
});
