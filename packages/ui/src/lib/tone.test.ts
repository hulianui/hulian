import { describe, it, expect } from "vitest";
import { resolveTone } from "./tone";

describe("resolveTone", () => {
  it("语义色名 → var(--color-<name>)", () => {
    expect(resolveTone("primary")).toBe("var(--color-primary)");
    expect(resolveTone("success")).toBe("var(--color-success)");
    expect(resolveTone("chart-5")).toBe("var(--color-chart-5)");
  });

  it("漏前缀的 var(--xxx) 已知 token 自动补全", () => {
    expect(resolveTone("var(--primary)")).toBe("var(--color-primary)");
    expect(resolveTone("var(--chart-2)")).toBe("var(--color-chart-2)");
    expect(resolveTone("var(--danger)")).toBe("var(--color-danger)");
  });

  it("已带前缀 / 原始 CSS 颜色原样透传", () => {
    expect(resolveTone("var(--color-primary)")).toBe("var(--color-primary)");
    expect(resolveTone("#ff0000")).toBe("#ff0000");
    expect(resolveTone("oklch(0.6 0.2 255)")).toBe("oklch(0.6 0.2 255)");
    expect(resolveTone("currentColor")).toBe("currentColor");
  });

  it("未知 var 不改写（非已知 token）", () => {
    expect(resolveTone("var(--radius)")).toBe("var(--radius)");
    expect(resolveTone("var(--my-custom)")).toBe("var(--my-custom)");
  });

  it("空值 → undefined（让组件套默认色）", () => {
    expect(resolveTone(undefined)).toBeUndefined();
    expect(resolveTone("")).toBeUndefined();
  });
});
