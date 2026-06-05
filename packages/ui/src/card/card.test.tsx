import { describe, it, expect } from "vitest";
import { cardVariants } from "./card";

describe("cardVariants", () => {
  it("默认 outline 带边框", () => {
    expect(cardVariants({})).toContain("border-border");
  });
  it("elevated 带 hover 阴影", () => {
    expect(cardVariants({ variant: "elevated" })).toContain("hover:shadow-md");
  });
  it("featured 带 primary 描边", () => {
    expect(cardVariants({ variant: "featured" })).toContain("border-primary");
  });
});
