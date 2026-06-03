import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AnimatedShinyText } from "./animated-shiny-text";

describe("AnimatedShinyText", () => {
  it("渲染文本 + shiny-text 动画类", () => {
    const { container } = render(<AnimatedShinyText>Introducing</AnimatedShinyText>);
    const span = container.firstElementChild!;
    expect(span.textContent).toBe("Introducing");
    expect(span.getAttribute("class")).toContain("[animation:hulian-shiny-text");
  });
  it("bg-clip-text + 高光走 via-foreground/80（token）", () => {
    const { container } = render(<AnimatedShinyText>x</AnimatedShinyText>);
    const cls = container.firstElementChild!.getAttribute("class")!;
    expect(cls).toContain("bg-clip-text");
    expect(cls).toContain("via-foreground/80");
  });
  it("shimmerWidth 落 --hulian-shiny-width 变量", () => {
    const { container } = render(<AnimatedShinyText shimmerWidth={180}>x</AnimatedShinyText>);
    const span = container.firstElementChild as HTMLElement;
    expect(span.style.getPropertyValue("--hulian-shiny-width")).toBe("180px");
  });
  it("motion-reduce 停 + className/props 透传", () => {
    const { container } = render(<AnimatedShinyText className="text-sm" data-testid="st">x</AnimatedShinyText>);
    const span = container.firstElementChild!;
    expect(span.getAttribute("class")).toContain("text-sm");
    expect(span.getAttribute("class")).toContain("motion-reduce:[animation:none]");
    expect(span.getAttribute("data-testid")).toBe("st");
  });
});
