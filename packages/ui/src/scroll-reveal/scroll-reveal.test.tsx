import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ScrollReveal } from "./scroll-reveal";

describe("ScrollReveal", () => {
  it("渲染完整文本（读屏可读全段）", () => {
    const { container } = render(<ScrollReveal>hello world foo</ScrollReveal>);
    expect(container.textContent).toBe("hello world foo");
  });
  it("逐词拆分（三词三段 inline-block）", () => {
    const { container } = render(<ScrollReveal>a b c</ScrollReveal>);
    const words = container.querySelectorAll(".inline-block");
    expect(words.length).toBe(3);
  });
  it("className 透传 + 旋转 origin token 类在段落上", () => {
    const { container } = render(<ScrollReveal className="text-xl">x</ScrollReveal>);
    const cls = container.firstElementChild!.getAttribute("class")!;
    expect(cls).toContain("text-xl");
    expect(cls).toContain("text-foreground");
    expect(cls).toContain("[transform-origin:0%_50%]");
  });
  it("透传任意 props（data-* / id）到根段落", () => {
    const { container } = render(
      <ScrollReveal data-testid="sr" id="lead">hello world</ScrollReveal>,
    );
    const p = container.firstElementChild!;
    expect(p.getAttribute("data-testid")).toBe("sr");
    expect(p.getAttribute("id")).toBe("lead");
  });
});
