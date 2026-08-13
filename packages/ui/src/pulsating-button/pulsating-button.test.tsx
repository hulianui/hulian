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
  it("render 接管元素：脉冲样式的链接 CTA（#256）", () => {
    const { container } = render(
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <PulsatingButton render={<a href="/signup" />}>立即注册</PulsatingButton>,
    );
    const anchor = container.querySelector("a") as HTMLAnchorElement;
    expect(anchor.getAttribute("href")).toBe("/signup");
    expect(anchor.textContent).toContain("立即注册");
    expect(container.querySelector("button")).toBeFalsy();
    // 光环是元素自己的 box-shadow 关键帧，样式与变量都要跟过去
    expect(anchor.getAttribute("class")).toContain("[animation:hulian-pulse-ring");
    expect(anchor.style.getPropertyValue("--hulian-pulse-duration")).toBe("1.5s");
  });
});
