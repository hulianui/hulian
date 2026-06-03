import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ShimmerButton } from "./shimmer-button";

describe("ShimmerButton", () => {
  it("渲染 button + children", () => {
    const { container } = render(<ShimmerButton>点我</ShimmerButton>);
    const btn = container.querySelector("button")!;
    expect(btn).not.toBeNull();
    expect(btn.textContent).toContain("点我");
  });
  it("含 shimmer-slide + spin-around 双动画类", () => {
    const { container } = render(<ShimmerButton>x</ShimmerButton>);
    const html = container.innerHTML;
    expect(html).toContain("hulian-shimmer-slide");
    expect(html).toContain("hulian-spin-around");
  });
  it("默认底色/火花/圆角落 hulian- 前缀 CSS 变量（不撞全局 --radius）", () => {
    const { container } = render(<ShimmerButton>x</ShimmerButton>);
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.style.getPropertyValue("--hulian-shimmer-bg")).toBe("var(--color-primary)");
    expect(btn.style.getPropertyValue("--hulian-shimmer-radius")).toBe("var(--radius)");
    expect(btn.style.getPropertyValue("--hulian-shimmer-color")).toBe("var(--color-primary-foreground)");
  });
  it("自定义 props 覆盖 + 透传 onClick/type", () => {
    const { container } = render(
      <ShimmerButton background="var(--color-danger)" shimmerDuration="2s" type="submit">
        x
      </ShimmerButton>,
    );
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.style.getPropertyValue("--hulian-shimmer-bg")).toBe("var(--color-danger)");
    expect(btn.style.getPropertyValue("--hulian-shimmer-speed")).toBe("2s");
    expect(btn.getAttribute("type")).toBe("submit");
  });
  it("motion-reduce 停 + className 透传", () => {
    const { container } = render(<ShimmerButton className="w-40">x</ShimmerButton>);
    const btn = container.querySelector("button")!;
    expect(btn.getAttribute("class")).toContain("w-40");
    expect(container.innerHTML).toContain("motion-reduce:[animation:none]");
  });
});
