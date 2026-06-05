import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GradualBlur } from "./gradual-blur";

// 结构：根容器(absolute·overflow-hidden) > 模糊层包裹(pointer-events-none) > N 个模糊切片 div。
const rootOf = (c: HTMLElement) => c.firstElementChild as HTMLElement;
const layersWrapOf = (c: HTMLElement) =>
  rootOf(c).querySelector(".pointer-events-none") as HTMLElement;

describe("GradualBlur", () => {
  it("默认渲染 divCount 个模糊切片，不抛错（jsdom 无 backdrop-filter 也安全）", () => {
    const { container } = render(<GradualBlur />);
    const wrap = layersWrapOf(container);
    // 默认 divCount=5
    expect(wrap.children.length).toBe(5);
    // 切片带 mask-image（black/transparent 中性 mask）
    const first = wrap.firstElementChild as HTMLElement;
    expect(
      first.style.getPropertyValue("mask-image") ||
        (first.getAttribute("style") ?? ""),
    ).toContain("linear-gradient");
  });

  it("divCount prop 决定切片数量", () => {
    const { container } = render(<GradualBlur divCount={8} />);
    expect(layersWrapOf(container).children.length).toBe(8);
  });

  it("position=top 时方向走 to top；默认 bottom 走 to bottom（token 无关的中性 mask）", () => {
    const { container: top } = render(<GradualBlur position="top" />);
    const topStyle =
      (layersWrapOf(top).firstElementChild as HTMLElement).getAttribute(
        "style",
      ) ?? "";
    expect(topStyle).toContain("to top");

    const { container: bottom } = render(<GradualBlur />);
    const bottomStyle =
      (layersWrapOf(bottom).firstElementChild as HTMLElement).getAttribute(
        "style",
      ) ?? "";
    expect(bottomStyle).toContain("to bottom");
  });

  it("无 hoverIntensity 时根容器 pointer-events:none（不挡下层交互）", () => {
    const { container } = render(<GradualBlur />);
    expect(rootOf(container).style.pointerEvents).toBe("none");

    const { container: hov } = render(<GradualBlur hoverIntensity={1.5} />);
    expect(rootOf(hov).style.pointerEvents).toBe("auto");
  });

  it("className / style 透传到根容器，children 渲染在 z-10 层", () => {
    const { container, getByText } = render(
      <GradualBlur className="test-gb" zIndex={42}>
        <span>贴边内容</span>
      </GradualBlur>,
    );
    const root = rootOf(container);
    expect(root.className).toContain("test-gb");
    expect(root.className).toContain("overflow-hidden");
    expect(root.style.zIndex).toBe("42");
    const content = getByText("贴边内容").closest("div");
    expect(content?.className).toContain("z-10");
  });
});
