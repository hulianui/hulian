import { describe, it, expect } from "vitest";
import { badgeVariants } from "./badge";

describe("badgeVariants", () => {
  it("默认 = solid brand md", () => {
    const c = badgeVariants({});
    expect(c).toContain("bg-primary");
    expect(c).toContain("h-6");
  });
  it("solid danger 换 danger 底", () => {
    expect(badgeVariants({ variant: "solid", tone: "danger" })).toContain("bg-danger");
  });
  it("outline neutral 用边框", () => {
    expect(badgeVariants({ variant: "outline", tone: "neutral" })).toContain("border");
  });
});
