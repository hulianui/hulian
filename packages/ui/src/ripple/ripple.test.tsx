import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Ripple } from "./ripple";

const circlesOf = (container: HTMLElement) =>
  container.firstElementChild!.querySelectorAll(":scope > div");

describe("Ripple", () => {
  it("默认渲染 numCircles=8 个圆环", () => {
    const { container } = render(<Ripple />);
    expect(circlesOf(container).length).toBe(8);
  });
  it("numCircles 可配置圈数", () => {
    const { container } = render(<Ripple numCircles={3} />);
    expect(circlesOf(container).length).toBe(3);
  });
  it("第 i 圈尺寸 = mainCircleSize + i*70（递增）", () => {
    const { container } = render(<Ripple mainCircleSize={200} numCircles={3} />);
    const circles = circlesOf(container);
    expect((circles[0] as HTMLElement).style.width).toBe("200px");
    expect((circles[1] as HTMLElement).style.width).toBe("270px");
    expect((circles[2] as HTMLElement).style.width).toBe("340px");
  });
  it("第 i 圈动画延迟 = i*0.06s", () => {
    const { container } = render(<Ripple numCircles={3} />);
    const circles = circlesOf(container);
    expect((circles[0] as HTMLElement).style.animationDelay).toBe("0s");
    expect((circles[1] as HTMLElement).style.animationDelay).toBe("0.06s");
    expect((circles[2] as HTMLElement).style.animationDelay).toBe("0.12s");
  });
  it("每圈带 hulian-ripple 动画类 + motion-reduce 停 + 居中 transform", () => {
    const { container } = render(<Ripple numCircles={2} />);
    const c0 = circlesOf(container)[0];
    expect(c0.getAttribute("class")).toContain("[animation:hulian-ripple");
    expect(c0.getAttribute("class")).toContain("motion-reduce:[animation:none]");
    expect(c0.getAttribute("class")).toContain("[transform:translate(-50%,-50%)]");
  });
  it("背景层语义 + className/props 透传", () => {
    const { container } = render(<Ripple className="text-primary" data-testid="rp" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("absolute");
    expect(root.getAttribute("class")).toContain("inset-0");
    expect(root.getAttribute("class")).toContain("pointer-events-none");
    expect(root.getAttribute("class")).toContain("text-primary");
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.getAttribute("data-testid")).toBe("rp");
  });
});
