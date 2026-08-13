import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { RainbowButton } from "./rainbow-button";

describe("RainbowButton", () => {
  it("渲染 button + children + rainbow 动画类", () => {
    const { container } = render(<RainbowButton>彩虹</RainbowButton>);
    const btn = container.querySelector("button")!;
    expect(btn.textContent).toContain("彩虹");
    expect(btn.getAttribute("class")).toContain("[animation:hulian-rainbow");
  });
  it("底色用 chart token 渐变 + bg-size 200%", () => {
    const { container } = render(<RainbowButton>x</RainbowButton>);
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.style.backgroundImage).toContain("var(--color-chart-1)");
    expect(btn.style.backgroundSize).toBe("200%");
  });
  it("含底部模糊光晕层（blur-lg + aria-hidden）", () => {
    const { container } = render(<RainbowButton>x</RainbowButton>);
    const glow = container.querySelector('[aria-hidden="true"]')!;
    expect(glow.getAttribute("class")).toContain("blur-lg");
  });
  it("speed 落 CSS 变量 + animation + motion-reduce + props 透传", () => {
    const { container } = render(<RainbowButton speed="5s" type="button">x</RainbowButton>);
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.style.getPropertyValue("--hulian-rainbow-speed")).toBe("5s");
    expect(btn.getAttribute("type")).toBe("button");
    expect(btn.getAttribute("class")).toContain("motion-reduce:[animation:none]");
  });
  it("render 接管元素：落地页主 CTA 常常是链接而不是按钮（#256）", () => {
    const { container } = render(
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <RainbowButton render={<a href="/pricing" />}>看价格</RainbowButton>,
    );
    const anchor = container.querySelector("a")!;
    expect(anchor.getAttribute("href")).toBe("/pricing");
    expect(anchor.textContent).toContain("看价格");
    expect(container.querySelector("button")).toBeFalsy();
  });
  it("render 下彩虹样式与定位上下文一起过去（光晕靠 relative 定位在按钮内）", () => {
    const { container } = render(
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <RainbowButton render={<a href="/x" />}>x</RainbowButton>,
    );
    const anchor = container.querySelector("a") as HTMLAnchorElement;
    expect(anchor.getAttribute("class")).toContain("relative");
    expect(anchor.getAttribute("class")).toContain("[animation:hulian-rainbow");
    expect(anchor.style.backgroundImage).toContain("var(--color-chart-1)");
    expect(anchor.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
