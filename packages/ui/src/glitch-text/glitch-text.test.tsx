import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GlitchText } from "./glitch-text";

describe("GlitchText", () => {
  it("data-text 与文本一致（供伪元素 attr 复制）", () => {
    const { container } = render(<GlitchText>BOOT</GlitchText>);
    const el = container.firstElementChild!;
    expect(el.getAttribute("data-text")).toBe("BOOT");
    expect(el.textContent).toBe("BOOT");
  });
  it("speed 落到 --hulian-glitch-dur 变量", () => {
    const { container } = render(<GlitchText speed={4}>X</GlitchText>);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--hulian-glitch-dur")).toBe("4s");
  });
  it("默认常驻故障：含非 hover 前缀的动画类", () => {
    const { container } = render(<GlitchText>X</GlitchText>);
    const cls = container.firstElementChild!.getAttribute("class") ?? "";
    expect(cls).toContain("before:[animation:hulian-glitch-1");
    expect(cls).not.toContain("hover:before:[animation:hulian-glitch-1");
  });
  it("enableOnHover 时动画门控在 hover: 前缀", () => {
    const { container } = render(<GlitchText enableOnHover>X</GlitchText>);
    const cls = container.firstElementChild!.getAttribute("class") ?? "";
    expect(cls).toContain("hover:before:[animation:hulian-glitch-1");
  });
  it("撕裂色用 chart token（吃主题，不写死红/青）", () => {
    const { container } = render(<GlitchText>X</GlitchText>);
    const cls = container.firstElementChild!.getAttribute("class") ?? "";
    expect(cls).toContain("var(--color-chart-1)");
    expect(cls).toContain("var(--color-chart-3)");
  });
});
