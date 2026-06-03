import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AnimatedGradientText } from "./animated-gradient-text";

describe("AnimatedGradientText", () => {
  it("渲染文本 + bg-clip-text 透明 + aurora 动画类", () => {
    const { container } = render(<AnimatedGradientText>Hulian</AnimatedGradientText>);
    const span = container.firstElementChild!;
    expect(span.textContent).toBe("Hulian");
    expect(span.getAttribute("class")).toContain("bg-clip-text");
    expect(span.getAttribute("class")).toContain("text-transparent");
    expect(span.getAttribute("class")).toContain("[animation:hulian-aurora");
  });
  it("默认 chart token 拼渐变", () => {
    const { container } = render(<AnimatedGradientText>x</AnimatedGradientText>);
    const span = container.firstElementChild as HTMLElement;
    expect(span.style.backgroundImage).toContain("var(--color-chart-1)");
  });
  it("speed 换算 duration 变量（8/speed）", () => {
    const { container } = render(<AnimatedGradientText speed={4}>x</AnimatedGradientText>);
    const span = container.firstElementChild as HTMLElement;
    expect(span.style.getPropertyValue("--hulian-gradient-duration")).toBe("2s");
  });
  it("motion-reduce 停 + className/props 透传", () => {
    const { container } = render(<AnimatedGradientText className="text-lg" data-testid="gt">x</AnimatedGradientText>);
    const span = container.firstElementChild!;
    expect(span.getAttribute("class")).toContain("text-lg");
    expect(span.getAttribute("class")).toContain("motion-reduce:[animation:none]");
    expect(span.getAttribute("data-testid")).toBe("gt");
  });
});
