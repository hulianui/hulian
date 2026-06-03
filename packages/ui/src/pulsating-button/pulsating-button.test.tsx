import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PulsatingButton } from "./pulsating-button";

describe("PulsatingButton", () => {
  it("渲染 button + children + pulse-ring 动画类", () => {
    const { container } = render(<PulsatingButton>订阅</PulsatingButton>);
    const btn = container.querySelector("button")!;
    expect(btn.textContent).toContain("订阅");
    expect(btn.getAttribute("class")).toContain("[animation:hulian-pulse-ring");
  });
  it("duration 落 CSS 变量", () => {
    const { container } = render(<PulsatingButton duration="2s">x</PulsatingButton>);
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.style.getPropertyValue("--hulian-pulse-duration")).toBe("2s");
  });
  it("pulseColor 传时才落变量（默认走 preset 兜底）", () => {
    const off = render(<PulsatingButton>x</PulsatingButton>);
    expect((off.container.querySelector("button") as HTMLButtonElement).style.getPropertyValue("--hulian-pulse-color")).toBe("");
    const on = render(<PulsatingButton pulseColor="var(--color-danger)">x</PulsatingButton>);
    expect((on.container.querySelector("button") as HTMLButtonElement).style.getPropertyValue("--hulian-pulse-color")).toBe("var(--color-danger)");
  });
  it("motion-reduce 停 + className/props 透传", () => {
    const { container } = render(<PulsatingButton className="w-32" type="button">x</PulsatingButton>);
    const btn = container.querySelector("button")!;
    expect(btn.getAttribute("class")).toContain("w-32");
    expect(btn.getAttribute("class")).toContain("motion-reduce:[animation:none]");
    expect(btn.getAttribute("type")).toBe("button");
  });
});
