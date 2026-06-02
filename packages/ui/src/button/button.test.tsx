import { describe, it, expect } from "vitest";
import { buttonVariants } from "./button";

describe("buttonVariants", () => {
  it("default = solid brand md", () => {
    const c = buttonVariants({});
    expect(c).toContain("bg-primary");
    expect(c).toContain("h-10");
  });
  it("danger solid swaps to danger bg", () => {
    expect(buttonVariants({ variant: "solid", tone: "danger" })).toContain("bg-danger");
  });
});
