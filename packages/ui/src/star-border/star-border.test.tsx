import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { StarBorder } from "./star-border";

describe("StarBorder", () => {
  it("默认渲染 button 根 + 内容 + 两道光带动画类", () => {
    const { container } = render(<StarBorder>Star</StarBorder>);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("BUTTON");
    expect(root.textContent).toBe("Star");
    const animated = container.querySelectorAll('[class*="animation:hulian-star-border"]');
    expect(animated.length).toBe(2);
  });

  it("内壳走 token：bg-surface / border-border / text-foreground", () => {
    const { container } = render(<StarBorder>x</StarBorder>);
    const inner = container.querySelector(".bg-surface")!;
    expect(inner).not.toBeNull();
    const cls = inner.getAttribute("class")!;
    expect(cls).toContain("border-border");
    expect(cls).toContain("text-foreground");
  });

  it("speed 落 --hulian-star-speed 变量 + color 喂进 radial-gradient", () => {
    const { container } = render(
      <StarBorder speed={3} color="var(--color-chart-2)">
        x
      </StarBorder>,
    );
    const band = container.querySelector('[class*="animation:hulian-star-border"]') as HTMLElement;
    expect(band.style.getPropertyValue("--hulian-star-speed")).toBe("3s");
    expect(band.style.background).toContain("var(--color-chart-2)");
  });

  it("as 多态 + thickness 内边距 + className/props 透传", () => {
    const { container } = render(
      <StarBorder as="a" thickness={2} className="w-40" data-testid="sb">
        x
      </StarBorder>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.tagName).toBe("A");
    expect(root.style.padding).toBe("2px 0px");
    expect(root.getAttribute("class")).toContain("w-40");
    expect(root.getAttribute("data-testid")).toBe("sb");
  });

  it("reduced-motion 路径：光带带 motion-reduce 停，DOM 不变", () => {
    const { container } = render(<StarBorder>x</StarBorder>);
    const bands = container.querySelectorAll('[class*="animation:hulian-star-border"]');
    bands.forEach((b) => {
      expect(b.getAttribute("class")).toContain("motion-reduce:[animation:none]");
    });
  });
});
