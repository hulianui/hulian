import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StripedPattern } from "./striped-pattern";

describe("StripedPattern", () => {
  it("渲染根 div", () => {
    const { container } = render(<StripedPattern />);
    expect(container.firstElementChild!.tagName).toBe("DIV");
  });
  it("backgroundImage 用 repeating-linear-gradient + currentColor", () => {
    const { container } = render(<StripedPattern />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.backgroundImage).toContain("repeating-linear-gradient");
    expect(root.style.backgroundImage).toContain("currentColor");
  });
  it("angle/size 落 CSS 变量", () => {
    const { container } = render(<StripedPattern angle={30} size={16} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hulian-striped-angle")).toBe("30deg");
    expect(root.style.getPropertyValue("--hulian-striped-size")).toBe("16px");
  });
  it("背景层语义：absolute inset-0 + pointer-events-none + text-border + aria-hidden", () => {
    const { container } = render(<StripedPattern />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("absolute");
    expect(root.getAttribute("class")).toContain("inset-0");
    expect(root.getAttribute("class")).toContain("pointer-events-none");
    expect(root.getAttribute("class")).toContain("text-border");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });
  it("className 与 props 透传", () => {
    const { container } = render(<StripedPattern className="text-muted" data-testid="sp" />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("text-muted");
    expect(root.getAttribute("data-testid")).toBe("sp");
  });
});
