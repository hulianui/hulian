import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DotPattern } from "./dot-pattern";

describe("DotPattern", () => {
  it("渲染 svg 且含 pattern + circle", () => {
    const { container } = render(<DotPattern />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("pattern")).not.toBeNull();
    expect(container.querySelector("circle")).not.toBeNull();
  });
  it("width/height/cr 落到 pattern/circle 属性", () => {
    const { container } = render(<DotPattern width={32} height={24} cr={2} />);
    const pattern = container.querySelector("pattern")!;
    expect(pattern.getAttribute("width")).toBe("32");
    expect(pattern.getAttribute("height")).toBe("24");
    expect(container.querySelector("circle")!.getAttribute("r")).toBe("2");
  });
  it("circle 走 currentColor（根 fill-current + text-border 默认）", () => {
    const { container } = render(<DotPattern />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("class")).toContain("fill-current");
    expect(svg.getAttribute("class")).toContain("text-border");
  });
  it("背景层语义：absolute inset-0 + pointer-events-none + aria-hidden", () => {
    const { container } = render(<DotPattern />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("class")).toContain("absolute");
    expect(svg.getAttribute("class")).toContain("inset-0");
    expect(svg.getAttribute("class")).toContain("pointer-events-none");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });
  it("多实例 pattern id 不撞车（useId）", () => {
    const { container } = render(
      <>
        <DotPattern />
        <DotPattern />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("pattern")).map((p) => p.id);
    expect(ids[0]).not.toBe(ids[1]);
    // rect 的 fill 引用各自的 id
    const rects = container.querySelectorAll("rect");
    expect(rects[0].getAttribute("fill")).toBe(`url(#${ids[0]})`);
  });
  it("className 与 props 透传", () => {
    const { container } = render(<DotPattern className="text-muted-foreground" data-testid="dp" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("class")).toContain("text-muted-foreground");
    expect(svg.getAttribute("data-testid")).toBe("dp");
  });
});
