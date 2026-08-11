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

  // hulianui/hulian#159：bg-surface 原先在 base 里，plain 无论怎么写都去不掉底色。
  it("plain 不画边框/底色/阴影", () => {
    const cls = cardVariants({ variant: "plain" });
    expect(cls).not.toContain("border");
    expect(cls).not.toContain("bg-surface");
    expect(cls).not.toContain("shadow-sm");
    expect(cls).not.toContain("shadow-md");
  });

  it("其余三档各自带 bg-surface（底色跟着变体走，不在 base）", () => {
    for (const variant of ["outline", "elevated", "featured"] as const) {
      expect(cardVariants({ variant })).toContain("bg-surface");
    }
  });

  it("plain 仍保留圆角与文字色", () => {
    const cls = cardVariants({ variant: "plain" });
    expect(cls).toContain("rounded-[var(--radius)]");
    expect(cls).toContain("text-foreground");
  });
});
